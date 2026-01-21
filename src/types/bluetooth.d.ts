/// <reference types="@types/web-bluetooth" />

declare global {
    interface Navigator {
        bluetooth: Bluetooth;
    }
}

export { };
