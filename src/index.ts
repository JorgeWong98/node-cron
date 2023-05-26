import { schedule } from 'node-cron';

import { authorize } from './services/GoogleService.js';
import { GmailService } from './services/GmailService.js';
import { CalenderService } from './services/CalendarService.js';

import moment from 'moment-timezone';
schedule('*/5 * * * *', async () => {
  console.log(`running your task...`);
  scheduleClasses();
});

const scheduleClasses = async () => {
  try {
    const auth = await authorize();
    const gmail = new GmailService(auth);
    const calendar = new CalenderService(auth);

    const emailList = await gmail.getEmailList();

    for (const email of emailList) {
      const emailData = await gmail.getEmailData({ emailId: email.id ?? '' });

      if (emailData.payload?.parts) {
        const emailContentBase64 = emailData.payload.parts[0].body?.data ?? '';

        const { teacher, date } = getEmailInfo(emailContentBase64);

        await calendar.schedule({ teacher, date });
        await gmail.markAsRead({ emailId: email.id ?? '' });
      }
    }

    const totalMeetings = emailList.length;

    const successMessage =
      totalMeetings > 0
        ? `Clases agendadas: ${totalMeetings}.`
        : 'No se encontraron clases para agendar';

    console.log(successMessage);
  } catch (error) {
    console.error(error);
  }
};

const getEmailInfo = (base64: string) => {
  const mailContent = getEmailContent(base64);
  let meetDate = moment(),
    meetTeacher = '';

  const dateRegex = /Hora:\s*(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})\s*MST/i;
  const dateMatches = mailContent.match(dateRegex);
  if (dateMatches?.length) {
    meetDate = moment(dateMatches[1], 'DD.MM.YYYY HH:mm');
  }

  const teacherNameRegex = /con\s+([^.]+)\./i;
  const teacherMatches = mailContent.match(teacherNameRegex);
  if (teacherMatches?.length) {
    meetTeacher = teacherMatches[1];
  }

  return { date: meetDate, teacher: meetTeacher };
};

const getEmailContent = (base64: string) => {
  // Decodifica la cadena a un objeto Buffer
  const buffer = Buffer.from(base64, 'base64');

  // Convierte el objeto Buffer a un string sin formato
  const plainText = buffer.toString('utf-8');

  const cleanString = plainText.replace(/[\r\n\t]/g, '');

  return cleanString;
};
