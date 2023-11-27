#!/usr/bin/env node

import { inspect } from 'node:util';
import { open } from 'node:fs/promises';
import axios from 'axios';
import { WebClient } from '@slack/web-api';

const BOT_TOKEN = 'xoxb-...';
const CHANNEL_ID = 'C...';

const FILE_NAME = 'test.txt';
const FILE_MIME_TYPE = 'text/plain';

const http = axios.create();
const slack = new WebClient(BOT_TOKEN);

const file = await open(FILE_NAME);
const { size: fileSize } = await file.stat();
const fileStream = file.createReadStream();

const { upload_url: uploadUrl, file_id: slackFileId } = await slack.files.getUploadURLExternal({
  filename: FILE_NAME,
  length: fileSize,
});

console.error('getUploadURLExternal result:', inspect({ uploadUrl, slackFileId }));

const { data: uploadResult } = await http.post(uploadUrl, fileStream, {
  headers: {
    Authorization: `Bearer ${BOT_TOKEN}`,
    'Content-Type': FILE_MIME_TYPE,
  },
});

console.error('file upload result:', inspect(uploadResult));

const completionResult = await slack.files.completeUploadExternal({
  channel_id: CHANNEL_ID,
  files: [{ id: slackFileId }],
  initial_comment: 'test upload',
});

console.error('completeUploadExternal result:', inspect(completionResult, { depth: null }));

if (Object.values(completionResult.files[0].shares).length === 0) {
  console.log('[ERR] `files[].shares` is empty object!');
  process.exit(1);
} else {
  console.log('[OK ] `files[].shares` is not empty object.');
  process.exit(0);
}
