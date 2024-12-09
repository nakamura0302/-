import dayjs from "dayjs";
import { colorOptions } from "../../util/color-options";


export async function retrieveEvents(calendars, start, end) {
    // {
    //      "time_max": "2024-10-19 09:00:00 000"
    //     "time_min":"2024-10-18 09:30:00.000",
    //     "calendar_id":"xiaoen.706@gmail.com"
    // }
    try {
        let result = [];
        for (let i = 0; i < calendars.length; i++) {
            const request = {
                calendar_id: calendars[i].id,
                // time_min: dayjs(start).format('YYYY-MM-DDTHH:mm:ss.000Z'),
                // time_max: dayjs(end).format('YYYY-MM-DDTHH:mm:ss.000Z')
            };
            const response = await fetch(`https://logi-attendance.new-challenge.jp/api/calendar/event/list`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });
            const res = await response.json();
            if(response.ok){
                result = [...result, ...res];
            }
        };
        console.log('Retrieve Events: ', result);
        return result;

    } catch (err) {
        console.log('retrieveEvents Error: ', err)
    }
}

export async function retrieveCalendars(data) {
    // {
    //     "calendars":"{'0':'xiaoen.706@gmail.com','1':'e7e6a2c4b9b8672d130eec30a9c6d56f3f6eae5ef77902e271c486a684a5682d@group.calendar.google.com'}"
    // }
    try {
        console.log('retrieveCalendars start: ', data);
        const request = {
            calendars: data
        };
        const response = await fetch(`https://logi-attendance.new-challenge.jp/api/calendar/info`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });
        const res = await response.json();
        const result = res.map((item, index) => {
            return { ...item, backgroundColor: colorOptions[index].value}
        })
        console.log('retrieveCalendars end: ', result);
        return result;
    } catch (err) {
        console.log('retrieveCalendars Error: ', err)
    }
}