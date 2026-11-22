import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export async function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (val: string | number) => {
    const str = String(val ?? '');
    if (/[",\n\r]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const lines = [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))];
  const csv = '\uFEFF' + lines.join('\r\n');

  // Android WebView does not reliably download blob: URLs. Use native
  // cache storage plus the Android share/save sheet instead.
  if (Capacitor.isNativePlatform()) {
    try {
      const bytes = new TextEncoder().encode(csv);
      let binary = '';
      const chunkSize = 32768;
      for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
      }
      const saved = await Filesystem.writeFile({
        path: filename,
        data: btoa(binary),
        directory: Directory.Cache,
      });
      await Share.share({
        title: 'خروجی اطلس مخاطرات',
        text: filename,
        url: saved.uri,
        dialogTitle: 'ذخیره یا اشتراک‌گذاری فایل CSV',
      });
    } catch (error) {
      console.error('Could not export the CSV on Android', error);
      window.alert('امکان ذخیره خروجی فراهم نشد. لطفاً دوباره تلاش کنید.');
    }
    return;
  }

  // UTF-8 BOM ensures Persian data is readable in Excel on Windows.
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
