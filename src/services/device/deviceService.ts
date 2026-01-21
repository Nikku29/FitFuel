/**
 * Device Service - Web Bluetooth API wrapper for Heart Rate monitors
 * Supports standard Bluetooth LE Heart Rate Service (0x180D)
 */

export class DeviceService {
    private device: BluetoothDevice | null = null;
    private heartRateCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
    private onHeartRateChange: ((bpm: number) => void) | null = null;

    /**
     * Check if Web Bluetooth is supported
     */
    isBluetoothSupported(): boolean {
        return 'bluetooth' in navigator;
    }

    /**
     * Connect to a Bluetooth Heart Rate Monitor
     */
    async connectHeartRateMonitor(): Promise<void> {
        if (!this.isBluetoothSupported()) {
            throw new Error('Web Bluetooth is not supported in this browser');
        }

        try {
            // Request device with Heart Rate service
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['battery_service']
            });

            if (!this.device.gatt) {
                throw new Error('GATT server not available');
            }

            // Connect to GATT server
            const server = await this.device.gatt.connect();

            // Get Heart Rate service
            const service = await server.getPrimaryService('heart_rate');

            // Get Heart Rate Measurement characteristic
            this.heartRateCharacteristic = await service.getCharacteristic('heart_rate_measurement');

            console.log(`Connected to ${this.device.name || 'Unknown Device'}`);
        } catch (error) {
            console.error('Failed to connect to heart rate monitor:', error);
            throw error;
        }
    }

    /**
     * Start receiving heart rate notifications
     */
    async startHeartRateNotifications(callback: (bpm: number) => void): Promise<void> {
        if (!this.heartRateCharacteristic) {
            throw new Error('No heart rate characteristic available. Connect first.');
        }

        this.onHeartRateChange = callback;

        // Start notifications
        await this.heartRateCharacteristic.startNotifications();

        // Listen for value changes
        this.heartRateCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
            const target = event.target as BluetoothRemoteGATTCharacteristic;
            const value = target.value;

            if (!value) return;

            // Parse Heart Rate Measurement
            // First byte contains flags
            const flags = value.getUint8(0);
            const rate16Bits = flags & 0x1;

            let heartRate: number;
            if (rate16Bits) {
                heartRate = value.getUint16(1, true); // Little endian
            } else {
                heartRate = value.getUint8(1);
            }

            if (this.onHeartRateChange) {
                this.onHeartRateChange(heartRate);
            }
        });
    }

    /**
     * Stop receiving heart rate notifications
     */
    async stopHeartRateNotifications(): Promise<void> {
        if (this.heartRateCharacteristic) {
            await this.heartRateCharacteristic.stopNotifications();
            this.onHeartRateChange = null;
        }
    }

    /**
     * Disconnect from the device
     */
    async disconnect(): Promise<void> {
        if (this.device?.gatt?.connected) {
            await this.stopHeartRateNotifications();
            this.device.gatt.disconnect();
            this.device = null;
            this.heartRateCharacteristic = null;
            console.log('Disconnected from heart rate monitor');
        }
    }

    /**
     * Get connection status
     */
    isConnected(): boolean {
        return this.device?.gatt?.connected || false;
    }

    /**
     * Get device name
     */
    getDeviceName(): string | null {
        return this.device?.name || null;
    }

    /**
     * Calculate calories burned from heart rate
     * Formula: Calories/min = (Age × 0.074) - (Weight × 0.05741) + (Heart Rate × 0.4472) - 20.4022
     * Simplified for demo purposes
     */
    calculateCaloriesBurned(bpm: number, durationMinutes: number, userWeight: number = 70, userAge: number = 30): number {
        // Simplified calorie calculation
        const caloriesPerMinute = ((userAge * 0.074) - (userWeight * 0.05741) + (bpm * 0.4472) - 20.4022) / 4.184;
        return Math.max(0, caloriesPerMinute * durationMinutes);
    }
}

export const deviceService = new DeviceService();
