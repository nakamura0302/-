
export async function deleteEvent(data){
    // {
    //     "calendar_id":"xiaoen.706@gmail.com",
    //     "event_id":"sla82l91r8brhno97t4eer1p74"
    // }
    try {
        const request ={
            calendar_id: data.calendarId,
            event_id: data.sid
        }
        const response = await fetch(`https://logi-attendance.new-challenge.jp/api/calendar/event/delete`, {
            method: 'POST', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });
        if (response.ok) {
            console.log('Delete Event Successful!');
            return 'success';  // Request was successful
        } else {
            console.error('Delete Event Failed: ', response.status);
            return 'fail';  // Request failed
        }
    } catch (error) {
        console.log('deleteEvent error: ', error);
    }
}

export async function deleteCalendar(){

}