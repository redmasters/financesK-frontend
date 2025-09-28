# FinancesK Design System - Mixins

Este arquivo contém todos os mixins SCSS centralizados do projeto FinancesK para garantir consistência e facilitar manutenção.

## Como usar

Importe os mixins em qualquer arquivo SCSS do componente:

```scss
@use '../../shared/styles/mixins' as *;
```

## Mixins disponíveis

### Layout & Containers

- `@include responsive-container` - Container responsivo com max-width
- `@include flex-center` - Flexbox centralizado
- `@include flex-between` - Flexbox com space-between
- `@include absolute-center` - Posicionamento absoluto centralizado

### Cards & Superfícies

- `@include card-base` - Card padrão com padding xl
- `@include card-sm` - Card pequeno com padding md
- `@include card-md` - Card médio com padding lg
- `@include card-lg` - Card grande com padding 2xl

### Botões & Interações

- `@include button-gradient($color1, $color2)` - Botão com gradiente e efeitos hover
- `@include shimmer-effect` - Efeito shimmer para hover
- `@include button-reset` - Reset completo de estilos de botão

### Formulários

- `@include form-field` - Estilo base para campos de formulário
- `@include input-with-icon` - Input com ícone posicionado
- `@include focus-ring($color)` - Ring de foco personalizado

### Backgrounds & Efeitos

- `@include gradient-background` - Gradiente principal do tema
- `@include overlay` - Overlay fixo para modais
- `@include modal-overlay` - Overlay com blur para modais

### Animações

- `@include slide-up-animation` - Animação de slide para cima
- `@include fade-in-animation($duration)` - Fade in customizável
- `@include dropdown-slide-animation` - Animação para dropdowns
- `@include loading-spinner` - Spinner de carregamento

### Utilidades

- `@include text-truncate` - Truncar texto com ellipsis
- `@include hide-scrollbar` - Ocultar scrollbar mantendo funcionalidade
- `@include custom-scrollbar($thumb, $track)` - Scrollbar personalizada

## Exemplo de uso

```scss
@use '../../shared/styles/mixins' as *;

.my-component {
  @include card-base;
  
  .header {
    @include flex-between;
  }
  
  .action-button {
    @include button-gradient(var(--success), var(--info));
  }
}
```

## Migração de componentes existentes

Se um componente já tem mixins duplicados:

1. Remova as definições de mixin locais
2. Adicione o import: `@use '../../shared/styles/mixins' as *;`
3. Use os mixins centralizados com `@include nome-do-mixin`

## Benefícios

- ✅ Consistência visual em toda a aplicação
- ✅ Manutenção simplificada (um local para alterar estilos)
- ✅ Redução do tamanho do bundle
- ✅ Melhor organização do código
- ✅ Reutilização eficiente de estilos
