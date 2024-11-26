import { useState, useEffect } from 'react'

export const useAlbumColor = (imageUrl) => {
  const [colors, setColors] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!imageUrl) {
      setLoading(false)
      return
    }

    const getImageColor = async () => {
      try {
        // Tạo một image element
        const img = new Image()
        img.crossOrigin = "Anonymous"
        
        img.onload = () => {
          // Tạo canvas để vẽ ảnh
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          
          // Vẽ ảnh lên canvas
          ctx.drawImage(img, 0, 0)
          
          // Lấy data của pixel từ canvas
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
          
          // Tính toán màu trung bình
          let r = 0, g = 0, b = 0
          for (let i = 0; i < imageData.length; i += 4) {
            r += imageData[i]
            g += imageData[i + 1]
            b += imageData[i + 2]
          }
          
          const pixels = imageData.length / 4
          r = Math.floor(r / pixels)
          g = Math.floor(g / pixels)
          b = Math.floor(b / pixels)
          
          // Tạo màu tối hơn cho gradient
          const darkerR = Math.floor(r * 0.6)
          const darkerG = Math.floor(g * 0.6)
          const darkerB = Math.floor(b * 0.6)
          
          setColors({
            dominant: `rgb(${r}, ${g}, ${b})`,
            darkMuted: `rgb(${darkerR}, ${darkerG}, ${darkerB})`
          })
          setLoading(false)
        }

        img.onerror = () => {
          console.error('Error loading image')
          setLoading(false)
        }

        // Thêm timestamp để tránh cache
        img.src = `${imageUrl}?t=${Date.now()}`
      } catch (error) {
        console.error('Error getting colors:', error)
        setLoading(false)
      }
    }

    getImageColor()
  }, [imageUrl])

  return { colors, loading }
}
