import { mount, VueWrapper } from '@vue/test-utils'
import RegisterComponent from '../components/RegisterComponent.vue' 
import { createTestingPinia } from '@pinia/testing'
import { useRouter } from 'vue-router'

jest.mock('vue-router', () => ({
  useRouter: jest.fn(),
}))

describe('RegisterComponent', () => {
  let wrapper: VueWrapper<any>
  let registerStoreMock: any
  let routerPushMock: jest.Mock

  beforeEach(() => {
    routerPushMock = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: routerPushMock,
    })

    const pinia = createTestingPinia({
      stubActions: false,
    })

    wrapper = mount(RegisterComponent, {
      global: {
        plugins: [pinia],
      },
    })

    registerStoreMock = wrapper.vm.registerStore
    registerStoreMock.register = jest.fn()
  })

  it('рендерит поля email, password, confirmPassword и кнопку', () => {
    expect(wrapper.find('input#email').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
    expect(wrapper.find('input#confirmPassword').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('валидирует email при blur', async () => {
    const emailInput = wrapper.find('input#email')

    // Пустой email
    await emailInput.setValue('')
    await emailInput.trigger('blur')
    expect(registerStoreMock.errors.email).toBe('Пожалуйста, введите ваш email')

    // Некорректный email
    await emailInput.setValue('invalid-email')
    await emailInput.trigger('blur')
    expect(registerStoreMock.errors.email).toBe('Пожалуйста, введите корректный email формата username@hostname.domain')

    // Корректный email
    await emailInput.setValue('test@example.com')
    await emailInput.trigger('blur')
    expect(registerStoreMock.errors.email).toBe('')
  })

  it('валидирует пароли при вводе', async () => {
    const passwordInput = wrapper.find('input#password')
    const confirmInput = wrapper.find('input#confirmPassword')

    // Пароль меньше 6 символов
    await passwordInput.setValue('123')
    await passwordInput.trigger('input')
    await confirmInput.setValue('123')
    await confirmInput.trigger('input')
    expect(registerStoreMock.errors.password).toBe('Пароль должен содержать минимум 6 символов')
    expect(registerStoreMock.errors.passwordMatch).toBe('')

    // Пароли не совпадают
    await passwordInput.setValue('123456')
    await passwordInput.trigger('input')
    await confirmInput.setValue('654321')
    await confirmInput.trigger('input')
    expect(registerStoreMock.errors.password).toBe('')
    expect(registerStoreMock.errors.passwordMatch).toBe('Пароли не совпадают')

    // Пароли совпадают и длина >= 6
    await passwordInput.setValue('abcdef')
    await passwordInput.trigger('input')
    await confirmInput.setValue('abcdef')
    await confirmInput.trigger('input')
    expect(registerStoreMock.errors.password).toBe('')
    expect(registerStoreMock.errors.passwordMatch).toBe('')
  })

  it('не вызывает register если есть ошибки при submit', async () => {
    registerStoreMock.errors.email = 'Ошибка'
    await wrapper.find('form').trigger('submit.prevent')
    expect(registerStoreMock.register).not.toHaveBeenCalled()
  })

  it('вызывает register и переходит на /profile при успешной регистрации', async () => {
    registerStoreMock.errors = { email: '', password: '', passwordMatch: '' }
    registerStoreMock.register.mockResolvedValue(true)

    await wrapper.find('form').trigger('submit.prevent')

    expect(registerStoreMock.register).toHaveBeenCalled()
    await wrapper.vm.$nextTick()
    expect(routerPushMock).toHaveBeenCalledWith('/profile')
  })

  it('не переходит если register возвращает false', async () => {
    registerStoreMock.errors = { email: '', password: '', passwordMatch: '' }
    registerStoreMock.register.mockResolvedValue(false)

    await wrapper.find('form').trigger('submit.prevent')

    expect(registerStoreMock.register).toHaveBeenCalled()
    await wrapper.vm.$nextTick()
    expect(routerPushMock).not.toHaveBeenCalled()
  })

  it('блокирует кнопку при загрузке', async () => {
    registerStoreMock.loading = true
    await wrapper.vm.$nextTick()

    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.text()).toBe('Регистрация...')
  })
})