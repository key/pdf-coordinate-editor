import { expect, test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { PdfEditorPage } from './helpers/pdf-editor.page';

test.describe('エクスポート・インポート', () => {
  let editor: PdfEditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new PdfEditorPage(page);
    await editor.goto();
    await editor.uploadAndWait('simple');
  });

  test('JSONエクスポートでダウンロードされる', async () => {
    // フィールドを作成
    await editor.clickOnCanvas(200, 300);
    await editor.closePopover();

    // ダウンロードイベントを待ち受け
    const downloadPromise = editor.page.waitForEvent('download');
    await editor.exportJsonButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });

  test('JSONエクスポートの内容にフィールド情報が含まれる', async () => {
    // フィールドを作成して名前を変更
    await editor.clickOnCanvas(200, 300);
    await editor.fieldNameInput.fill('test_name');
    await editor.closePopover();

    // JSONをダウンロードして内容を検証
    const downloadPromise = editor.page.waitForEvent('download');
    await editor.exportJsonButton.click();
    const download = await downloadPromise;

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    const json = JSON.parse(Buffer.concat(chunks).toString('utf-8'));

    expect(json).toHaveProperty('fields');
    expect(json).toHaveProperty('pdfDimensions');
    expect(json).toHaveProperty('exportedAt');
    expect(json.fields).toHaveLength(1);
    expect(json.fields[0]).toMatchObject({
      name: 'test_name',
      type: 'text',
      page: 1,
    });
    // 座標が数値であること
    expect(typeof json.fields[0].x).toBe('number');
    expect(typeof json.fields[0].y).toBe('number');
  });

  test('JSONインポートでフィールドが復元される', async () => {
    // テスト用JSONデータを作成（importJsonは { fields: [...] } 形式を期待する）
    const fieldData = {
      fields: [
        {
          name: 'imported_field',
          type: 'text',
          page: 1,
          x: 100,
          y: 500,
          width: 200,
          height: 20,
          fontSize: 12,
        },
      ],
    };
    const jsonBuffer = Buffer.from(JSON.stringify(fieldData));

    await editor.importJsonInput.setInputFiles({
      name: 'fields.json',
      mimeType: 'application/json',
      buffer: jsonBuffer,
    });

    // フィールドが一覧に表示される
    const item = editor.fieldList.locator('button').filter({ hasText: 'imported_field' });
    await expect(item).toBeVisible();
  });

  test('フォームPDF出力でダウンロードされる', async () => {
    // フィールドを作成
    await editor.clickOnCanvas(200, 300);
    await editor.closePopover();

    // ダウンロードイベントを待ち受け
    const downloadPromise = editor.page.waitForEvent('download');
    await editor.exportFormPdfButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('フォームPDF出力にAcroFormフィールドが含まれる', async () => {
    // テキストフィールドを作成して名前を設定
    await editor.clickOnCanvas(200, 300);
    await editor.fieldNameInput.fill('form_text');
    await editor.closePopover();

    // チェックボックスを作成して名前を設定
    await editor.clickOnCanvas(200, 400);
    await editor.fieldTypeCheckbox.click();
    await editor.fieldNameInput.fill('form_check');
    await editor.closePopover();

    // PDFをダウンロードしてpdf-libで検証
    const downloadPromise = editor.page.waitForEvent('download');
    await editor.exportFormPdfButton.click();
    const download = await downloadPromise;

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    const pdfBytes = Buffer.concat(chunks);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fieldNames = form.getFields().map((f) => f.getName());

    expect(fieldNames).toContain('form_text');
    expect(fieldNames).toContain('form_check');
    expect(fieldNames).toHaveLength(2);
  });

  test('フィールドなしではフォームPDFボタンが無効', async () => {
    await expect(editor.exportFormPdfButton).toBeDisabled();
  });
});
