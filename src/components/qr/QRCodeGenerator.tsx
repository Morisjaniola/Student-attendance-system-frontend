import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeGeneratorProps {
  value: string
  size?: number
  className?: string
  /** Accessible description for the QR code image. */
  ariaLabel?: string
}

/**
 * Renders a real, scannable QR code to a canvas.
 * Used by the table previews, the viewer modal, the print sheet, and downloads.
 */
export function QRCodeGenerator({ value, size = 160, className, ariaLabel }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !value) return
    let cancelled = false
    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    }).catch(() => {
      // A malformed payload is the only failure case; leave the canvas blank.
      if (!cancelled) {
        const context = canvas.getContext('2d')
        context?.clearRect(0, 0, canvas.width, canvas.height)
      }
    })
    return () => { cancelled = true }
  }, [value, size])

  return <canvas ref={canvasRef} className={className} role="img" aria-label={ariaLabel ?? `QR code ${value}`} />
}
