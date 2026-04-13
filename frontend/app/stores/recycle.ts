import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRecycleStore = defineStore('recycle', () => {
    const deviceType = ref('');
    const deviceName = ref('');
    const manufacturer = ref('');
    const condition = ref('WORKING'); // or NOT_WORKING
    /** Chuỗi base64 data URL (JPG/PNG) — gửi kèm API */
    const images = ref<string[]>([]);

    const collectionPointId = ref('');
    const collectionPoint = ref({});

    const scheduledDate = ref(new Date().toISOString().split('T')[0]);
    const scheduledTime = ref('');

    const trackingCode = ref('');

    function setDevice(type: string) {
        deviceType.value = type;
    }

    return {
        deviceType, deviceName, manufacturer, condition, images,
        collectionPointId, collectionPoint,
        scheduledDate, scheduledTime,
        trackingCode,
        setDevice
    }
});
