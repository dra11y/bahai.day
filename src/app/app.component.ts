import { Component } from '@angular/core'
import { CalendarOptions, DayCellContentArg, EventInput } from "@fullcalendar/core"
import { BadiDate, LocalBadiDate, badiDateSettings } from "badidate"
import dayGridPlugin from "@fullcalendar/daygrid"
import listPlugin from "@fullcalendar/list"
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-icons/font/bootstrap-icons.css'
import { DateTime } from 'luxon'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'bahai.day';

  latitude?: number
  longitude?: number
  calendarOptions?: CalendarOptions

  ngOnInit() {
    badiDateSettings({
      useClockLocations: true, // default: true
      defaultLanguage: 'en', // default: 'en'
      underlineFormat: 'diacritic', // default: 'css'
    })

    this.setCalendarOptions()
    this.getUserLocation()
  }

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.longitude = position.coords.longitude
        this.latitude = position.coords.latitude
        console.log(`LON, LAT = ${this.longitude}, ${this.latitude}`)
        this.setCalendarOptions()
      })
    } else {
      console.log("No support for geolocation")
    }
  }

  setCalendarOptions() {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      themeSystem: 'bootstrap5',
      plugins: [bootstrap5Plugin, dayGridPlugin, listPlugin],
      dayCellClassNames: (info: DayCellContentArg) => {
        var badiDate = new BadiDate(info.date)
        return [`month-${badiDate.month}`]
      },
      events: (info, successCallback, _failureCallback) => {
        var badiDate = new BadiDate(info.start)
        var eventInputs: EventInput[] = []
        const displayStart = new Date(info.start.getTime())
        const displayEnd = new Date(info.end.getTime())
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
        for (var dateTime = new Date(displayStart.getTime()); dateTime < displayEnd; dateTime.setDate(dateTime.getDate() + 1)) {
          const start = dateTime.getTime()
          const extraInfo = badiDate.day == 1 || displayStart.getTime() == dateTime.getTime()
          var format = 'd'
          if (extraInfo) {
            console.log(`dateTime = ${dateTime}`)
            format += ' MM+'
          }
          var title = badiDate.format(format)
          eventInputs.push({
            start,
            title,
            allDay: true,
            color: 'transparent',
            textColor: 'black',
            className: 'badi-date',
          })
          if (badiDate.day == 1 && this.latitude != null && this.longitude != null) {
            const localBadiDate = new LocalBadiDate(dateTime, this.latitude, this.longitude, timeZone)
            const event: EventInput = {
              start: localBadiDate.nextDay.start.toJSDate(),
              title: 'sunset',
              color: 'green',
              textColor: 'black',
            }
            eventInputs.push(event)
          }
          badiDate = badiDate.nextDay
        }
        successCallback(eventInputs)
      },
    }
  }
}
