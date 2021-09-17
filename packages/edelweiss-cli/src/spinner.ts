import ora from 'ora';

export const createSpinner = (text: string): ora.Ora =>
  ora({
    text,
    prefixText: '',
  }).start();
