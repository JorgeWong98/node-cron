import { google, Auth, calendar_v3 } from 'googleapis';
import { Moment } from 'moment-timezone';

interface SheduleData {
  teacher: string;
  date: Moment;
}

// duracion de las reuniones en minutos
const DURATION_MEETINGS = 15;

export class CalenderService {
  calendar: calendar_v3.Calendar;

  constructor(auth: any) {
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async schedule({ teacher, date }: SheduleData) {
    const startDate = date.format('YYYY-MM-DDTHH:mm:ss');

    const endDate = date
      .add(DURATION_MEETINGS, 'minutes')
      .format('YYYY-MM-DDTHH:mm:ss');

    const event = {
      summary: 'Sesión de inglés',
      description: `Profesor: ${teacher}`,
      start: {
        dateTime: `${startDate}-07:00`,
        timeZone: 'America/Phoenix',
      },
      end: {
        dateTime: `${endDate}-07:00`,
        timeZone: 'America/Phoenix',
      },
      reminders: {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: 10 }],
      },
    };

    const { data } = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    console.log('Clase agendada:', { ...event, link: data.htmlLink });
  }
}
