import { mount, VueWrapper } from '@vue/test-utils'
import LoginComponent from '../components/LoginPage.vue'
import { createTestingPinia } from '@pinia/testing'
import { useRouter } from 'vue-router'

jest.mock('vue-router', () => ({
  useRouter: jest.fn(),
}))

describe('LoginComponent', () => {
  let wrapper: VueWrapper<any>
  let authStoreMock: any
  let routerPushMock: jest.Mock

  beforeEach(() => {
    routerPushMock = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: routerPushMock,
    })

    const pinia = createTestingPinia({
      stubActions: false,
    })

    wrapper = mount(LoginComponent, {
      global: {
        plugins: [pinia],
      },
    })

    authStoreMock = wrapper.vm.authStore

    authStoreMock.login = jest.fn()
  })

  it('рендерит заголовок и кнопки', () => {
    expect(wrapper.find('h2.new-post__title').text()).toBe('Вход в профиль')
    expect(wrapper.find('button.btn-light').text()).toBe('Зарегистрироваться')
    expect(wrapper.find('button.btn-dark').text()).toBe('Войти')
  })

  it('отображает общую ошибку, если она есть', async () => {
    authStoreMock.errors.general = 'Общая ошибка'
    await wrapper.vm.$nextTick()
    const generalError = wrapper.find('span.new-post__massege.error')
    expect(generalError.exists()).toBe(true)
    expect(generalError.text()).toBe('Общая ошибка')
  })

  it('отображает ошибку для email и password', async () => {
    authStoreMock.errors.email = 'Ошибка email'
    authStoreMock.errors.password = 'Ошибка пароля'
    await wrapper.vm.$nextTick()

    const emailError = wrapper.findAll('span.new-post__massege.error').filter(w => w.text() === 'Ошибка email')
    const passwordError = wrapper.findAll('span.new-post__massege.error').filter(w => w.text() === 'Ошибка пароля')

    expect(emailError.length).toBeGreaterThan(0)
    expect(passwordError.length).toBeGreaterThan(0)
  })

  it('вызывает clearFieldError при вводе в поля', async () => {
    const clearFieldErrorSpy = jest.spyOn(wrapper.vm, 'clearFieldError')

    const emailInput = wrapper.find('input#email')
    await emailInput.setValue('test@example.com')
    expect(clearFieldErrorSpy).toHaveBeenCalledWith('email')

    const passwordInput = wrapper.find('input#password')
    await passwordInput.setValue('123456')
    expect(clearFieldErrorSpy).toHaveBeenCalledWith('password')
  })

  it('вызывает login и переходит на /profile при успешном входе', async () => {
    authStoreMock.login.mockResolvedValue(true)

    await wrapper.find('form').trigger('submit.prevent')

    expect(authStoreMock.login).toHaveBeenCalled()
    await wrapper.vm.$nextTick()
    expect(routerPushMock).toHaveBeenCalledWith('/profile')
  })

  it('не переходит при неуспешном входе', async () => {
    authStoreMock.login.mockResolvedValue(false)

    await wrapper.find('form').trigger('submit.prevent')

    expect(authStoreMock.login).toHaveBeenCalled()
    await wrapper.vm.$nextTick()
    expect(routerPushMock).not.toHaveBeenCalled()
  })

  it('блокирует кнопку при загрузке', async () => {
    authStoreMock.loading = true
    await wrapper.vm.$nextTick()

    const submitBtn = wrapper.find('button.btn-dark')
    expect(submitBtn.attributes('disabled')).toBeDefined()
    expect(submitBtn.text()).toBe('Вход...')
  })
})