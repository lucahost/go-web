/// <reference types="next" />
/// <reference types="next/types/global" />

import { Workbox } from 'workbox-window'

declare global {
    interface Window {
        workbox: Workbox
    }
}
