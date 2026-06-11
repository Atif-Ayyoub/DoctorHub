const path = require('path');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/database');

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'doctor-hub-uploads';

function sanitizeFileName(fileName = 'upload') {
  const parsed = path.parse(fileName);
  const name = parsed.name
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'upload';
  const ext = parsed.ext.replace(/[^a-zA-Z0-9.]/g, '').slice(0, 20);
  return `${name}${ext}`;
}

async function uploadFile(file, folder) {
  if (!file?.buffer) {
    const err = new Error('File buffer is required');
    err.status = 422;
    throw err;
  }

  const objectPath = `${folder}/${Date.now()}-${uuidv4()}-${sanitizeFileName(file.originalname)}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    const err = new Error(`Storage upload failed: ${uploadError.message}`);
    err.status = 500;
    throw err;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  return {
    path: objectPath,
    publicUrl: data.publicUrl,
  };
}

module.exports = {
  BUCKET,
  uploadFile,
};
