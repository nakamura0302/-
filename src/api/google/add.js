import dayjs from "dayjs";

export async function addEvent(data){
    // {
    //         "summary":"this is test google",
    //         "start":"2024-10-18 08:30:00.000",
    //         "end":"2024-10-18 09:30:00.000",
    //         "calendar_id":"xiaoen.706@gmail.com"
    // }
    try {
        const request = {
            summary: data.title,
            start: dayjs(data.dateTime.date).format('YYYY-MM-DD') + 'T' + data.dateTime.time.start + '.000Z',
            end: dayjs(data.dateTime.date).format('YYYY-MM-DD') + 'T' + data.dateTime.time.end + '.000Z',
            calendar_id: data.calendarId,
            description: data.description,
            location: data.location,
            remindTime: data.remindTime
        }
        const response = await fetch(`https://logi-attendance.new-challenge.jp/api/calendar/event/add`, {
            method: 'POST', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });
        const result = await response.json();
        console.log('Add Event Successful!: ', result);
        return result;
    } catch (error) {
        console.log('Add Event Failed: ', error);
    }
}

export async function addCalendar(){

}