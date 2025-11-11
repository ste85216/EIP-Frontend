// Utilities
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
	// 全局 UI 縮放，預設為 100%
	const uiScale = ref(100)

	// 內部：偵測是否支援 CSS zoom（Chromium 支援，Firefox 不支援）
	const isZoomSupported = () => {
		if (typeof document === 'undefined') return false
		return 'zoom' in document.body.style
	}

	// 將縮放套用到整個應用
	const applyScale = (percent) => {
		if (typeof document === 'undefined') return
		const factor = Number(percent) / 100

		if (isZoomSupported()) {
			document.body.style.zoom = String(factor)
		} else {
			const wrapper = document.getElementById('app-scale-wrapper')
			if (wrapper) {
				wrapper.style.transform = `scale(${factor})`
				wrapper.style.transformOrigin = '0 0'
				wrapper.style.width = `${100 / factor}%`
				wrapper.style.height = `${100 / factor}%`
			}
		}
	}

	// 外部：設定縮放
	const setScale = (percent) => {
		uiScale.value = Number(percent)
		applyScale(uiScale.value)
	}

	// 初始化套用縮放
	if (typeof document !== 'undefined') {
		applyScale(uiScale.value)
	}

	return {
		uiScale,
		setScale,
		applyScale
	}
}, {
	persist: {
		// 使用獨立 key，避免被其他 store 覆蓋
		key: 'ginternational_ui',
		paths: ['uiScale']
	}
})
