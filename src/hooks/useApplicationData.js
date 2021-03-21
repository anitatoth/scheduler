import { useState, useEffect } from 'react';
import axios from "axios";

export default function useApplicatiobData() {

  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

  const setDay = day => setState({ ...state, day });


  useEffect(() => {
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers")
    ])
    .then((all) => {
     setState(prev => ({...prev, days:all[0].data, appointments: all[1].data, interviewers:all[2].data }))
    })   
  }, []);


  function bookInterview(id, interview) {

    const appointment = {
      ...state.appointments[id],
      interview: { ...interview }
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment
    };

    const days = [...state.days];
    for (let index in days) {
      let day = days[index];
      if (day.appointments.includes(id)) {
        const newDay = { ...day, spots: day.spots - 1 };
        days[index] = newDay;
      }
    }

    return axios.put(`/api/appointments/${id}`, { interview })
      .then(() => {
      setState({ ...state, appointments, days });
      });
  };


  function cancelInterview(id) {
    
    const appointment = {
      ...state.appointments[id],
      interview: null,
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment
    };

    const days = [...state.days];
    for (let index in days) {
      let day = days[index];
      if (day.appointments.includes(id)) {
        const newDay = { ...day, spots: day.spots + 1 };
        days[index] = newDay;
      }
    }

    return axios.delete(`/api/appointments/${id}`)
    .then(() => setState({ ...state, appointments, days }))

  };
  

  return { state, setDay, bookInterview, cancelInterview };
}