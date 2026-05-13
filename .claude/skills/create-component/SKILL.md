---

name: create-component

description: Створює React компонент за шаблоном команди.

            - Використовуй: /create-component ComponentName

disable-model-invocation: true

---

## Створення компонента

1. Виконай команду: `/create-component ComponentName`
2. Вкажи тип компонента: `ui`, `page`, `widget` або `layout`
3. Вибери шаблон: `functional` або `class`  
4. Компонент буде створений в папці `src/components/ComponentName` з базовою структурою:

### Вимоги:

- TypeScript з PropTypes інтерфейсом

- SCSS module ($ARGUMENTS.module.scss)

- `export function`, не `export default`

- Базовий unit тест у `__tests__/`

- Barrel export через `index.ts`