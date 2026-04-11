import QRCode from "qrcode";

export async function generateQrDataUrl(value: string) {
  return QRCode.toDataURL(value, {
    width: 300,
    margin: 2,
  });
}
