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

    /** Đưa form về trạng thái ban đầu (gọi khi user rời khỏi luồng /recycle). */
    function reset() {
        deviceType.value = '';
        deviceName.value = '';
        manufacturer.value = '';
        condition.value = 'WORKING';
        images.value = [];
        collectionPointId.value = '';
        collectionPoint.value = {};
        scheduledDate.value = new Date().toISOString().split('T')[0];
        scheduledTime.value = '';
        trackingCode.value = '';
    }

    return {
        deviceType, deviceName, manufacturer, condition, images,
        collectionPointId, collectionPoint,
        scheduledDate, scheduledTime,
        trackingCode,
        setDevice,
        reset,
    }
});
