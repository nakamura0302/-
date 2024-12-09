import dayjs from "dayjs";

export async function editEvent(data) {
    try {
        const request = {
            summary: data.title,
            start: dayjs(data.dateTime.date).format('YYYY-MM-DD') + 'T' + data.dateTime.time.start + '.000Z',
            end: dayjs(data.dateTime.date).format('YYYY-MM-DD') + 'T' + data.dateTime.time.end + '.000Z',
            calendar_id: data.calendarId,
            description: data.description,
            location: data.location,
            remindTime: data.remindTime,
            event_id: data.sid
        };

        const response = await fetch(`https://logi-attendance.new-challenge.jp/api/calendar/event/edit`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });

        if (response.ok) {
            console.log('Edit Event Successful!');
            return 'success';  // Request was successful
        } else {
            console.error('Edit Event Failed: ', response.status);
            return 'fail';  // Request failed
        }
    } catch (error) {
        console.log('editEvent Error: ', error);
        return 'fail';  // Request failed due to an error
    }
}

export async function editCalendar(){

}