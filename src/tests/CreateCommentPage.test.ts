import { mount, VueWrapper } from '@vue/test-utils'
import CommentForm from '../components/CreateCommentPage.vue' 
import { createTestingPinia } from '@pinia/testing'
import { useRouter, useRoute } from 'vue-router'
import BackBtn from '../components/BackBtn.vue'
import SuccessPage from '../components/SuccessPage.vue'

jest.mock('vue-router', () => ({
  useRouter: jest.fn(),
  useRoute: jest.fn(),
}))

describe('CommentForm', () => {
  let wrapper: VueWrapper<any>
  let commentStoreMock: any
  let routerPushMock: jest.Mock
  let routerBackMock: jest.Mock
  let routeMock: any

  beforeEach(() => {
    routerPushMock = jest.fn()
    routerBackMock = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: routerPushMock,
      back: routerBackMock,
    })

    routeMock = {
      params: { id: '123' },
    }
    ;(useRoute as jest.Mock).mockReturnValue(routeMock)

    const pinia = createTestingPinia({
      stubActions: false,
    })

    wrapper = mount(CommentForm, {
      global: {
        plugins: [pinia],
        components: { BackBtn, SuccessPage },
      },
    })

    commentStoreMock = wrapper.vm.commentStore

    // Мокаем методы стора
    commentStoreMock.clearErrors = jest.fn()
    commentStoreMock.addComment = jest.fn()
  })

  it('рендерит заголовок, поля и кнопки', () => {
    expect(wrapper.find('h2.new-post__title').text()).toBe('Добавление отзыва')
    expect(wrapper.find('input#heading').exists()).toBe(true)
    expect(wrapper.find('textarea#comment').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('отображает общую ошибку, если она есть', async () => {
    commentStoreMock.errors.general = 'Общая ошибка'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.error-message').text()).toBe('Общая ошибка')
  })

  it('отображает ошибки для полей full_name и comment', async () => {
    commentStoreMock.errors.full_name = 'Ошибка имени'
    commentStoreMock.errors.comment = 'Ошибка отзыва'
    await wrapper.vm.$nextTick()

    const fullNameError = wrapper.find('span.new-post__massege.error')
    expect(fullNameError.exists()).toBe(true)
    expect(fullNameError.text()).toBe('Ошибка имени')

    const commentError = wrapper.findAll('span.new-post__massege.error').at(1)
    expect(commentError?.text()).toBe('Ошибка отзыва')
  })

  it('вызывает clearFieldError при вводе в input и textarea', async () => {
    const spy = jest.spyOn(wrapper.vm, 'clearFieldError')

    const input = wrapper.find('input#heading')
    await input.setValue('Иван')
    expect(spy).toHaveBeenCalledWith('full_name')

    const textarea = wrapper.find('textarea#comment')
    await textarea.setValue('Текст отзыва')
    expect(spy).toHaveBeenCalledWith('comment')
  })

  it('при отсутствии postId устанавливает общую ошибку и не вызывает addComment', async () => {
    routeMock.params.id = undefined
    await wrapper.vm.$nextTick()

    await wrapper.find('form').trigger('submit.prevent')

    expect(commentStoreMock.errors.general).toBe('ID поста не найден')
    expect(commentStoreMock.addComment).not.toHaveBeenCalled()
  })

  it('вызывает addComment и показывает модальное окно при успешной отправке', async () => {
    commentStoreMock.addComment.mockResolvedValue(true)

    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(commentStoreMock.addComment).toHaveBeenCalledWith('123')
    expect(wrapper.vm.showSuccessModal).toBe(true)
    expect(wrapper.findComponent(SuccessPage).exists()).toBe(true)
  })

  it('не показывает модальное окно при неуспешной отправке', async () => {
    commentStoreMock.addComment.mockResolvedValue(false)

    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.showSuccessModal).toBe(false)
    expect(wrapper.findComponent(SuccessPage).exists()).toBe(false)
  })

  it('закрывает модальное окно и переходит на страницу поста', async () => {
    wrapper.vm.showSuccessModal = true
    await wrapper.vm.$nextTick()

    wrapper.vm.handleSuccessClose()
    expect(wrapper.vm.showSuccessModal).toBe(false)
    expect(routerPushMock).toHaveBeenCalledWith('/posts/123')
  })

  it('обрабатывает событие close от BackBtn: вызывает router.back если есть история', async () => {
    Object.defineProperty(window.history, 'length', { value: 2, configurable: true })

    wrapper.vm.handleClose()
    expect(routerBackMock).toHaveBeenCalled()
  })

  it('обрабатывает событие close от BackBtn: вызывает router.push если истории нет', async () => {
    Object.defineProperty(window.history, 'length', { value: 1, configurable: true })

    wrapper.vm.handleClose()
    expect(routerPushMock).toHaveBeenCalledWith({ path: '/' })
  })

  it('кнопка submit блокируется при загрузке', async () => {
    commentStoreMock.loading = true
    await wrapper.vm.$nextTick()

    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.text()).toBe('Сохранение...')
  })

  it('счетчик символов отображает длину текста и maxLength', async () => {
    commentStoreMock.form.comment = '12345'
    await wrapper.vm.$nextTick()

    const counter = wrapper.find('.new-post__counter')
    expect(counter.text()).toBe('5 / 2000')
  })
})