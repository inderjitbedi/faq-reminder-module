import { environment } from './../../environments/environment';

export namespace Constants {
  export const version = `Version: ${environment.version}`;
  export const productName = 'Admin';
  export const copyright = `Copyright © ${new Date().getFullYear()}`;
  export const rightReserved = 'All rights reserved.';
  export const Pages = {
    LOGIN: 'login/',
    DASHBOARD: '/dashboard',
    FAQ_CATEGORY_LIST: '/dashboard/faq/categories',
    FAQ_LIST: '/dashboard/faq/categories-list',
    REMINDERS_LIST: '/dashboard/reminders/list',
    REMINDERS_ADD: '/dashboard/reminders/add',
    REMINDERS_EDIT: '/dashboard/reminders/edit',
  };
  export const ErrorMessages = {
    serverError: 'Server Error.',
    sessionExpired: 'Session Expired.',
  };

  export const ConfirmMessages = {};
  export const SuccessMessages = {};
  export const Roles = {
    '1': 'Admin',
    '2': 'Viewer',
  };
  export const allowedFileExtentions = ['txt', 'doc', 'docx', 'pdf', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'];
  export const allowedImageFileExtentions = ['png', 'jpg', 'jpeg'];
  export const viewableFileExtentions = ['png', 'jpg', 'jpeg'];
  export const maximumFileSize = 4000000;
  export const allowedVideoFileExtentions = ['png', 'jpg', 'jpeg'];
  export const allowedAudioFileExtentions = ['png', 'jpg', 'jpeg'];
  export const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/
  export const youtubeEmbedRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/

}
