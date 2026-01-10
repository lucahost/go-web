import 'styled-components'
import type { Theme } from './theme'

declare module 'styled-components' {
    // This interface must be empty to properly extend Theme for styled-components module augmentation
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface DefaultTheme extends Theme {}
}
