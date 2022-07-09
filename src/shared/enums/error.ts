export enum ErrorCode {
  SUCCESS = '00',
  SYSTEM_ERROR = '96',

  PRODUCT_UNREGISTERED = '20',
  CLASSIFY_UNREGISTERED = '21',
}

export enum ErrorMessage {
  SUCCESS = 'Thành công',
  SYSTEM_ERROR = 'Lỗi hệ thống',

  PRODUCT_INVALID = 'Sản phẩm không tồn tại',
  CLASSIFY_INVALID = 'Phân loại sản phẩm không tồn tại',
}
