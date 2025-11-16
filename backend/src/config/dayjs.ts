import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/es';

// Extiende plugins necesarios
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Define huso horario por defecto y locale
const DEFAULT_TZ = process.env.APP_TZ || 'America/Argentina/Buenos_Aires';
dayjs.tz.setDefault(DEFAULT_TZ);
dayjs.locale('es');

// Helpers opcionales
export const nowTz = () => dayjs.tz();
export const toTz = (date?: string | number | Date) => dayjs.tz(date);

export default dayjs;