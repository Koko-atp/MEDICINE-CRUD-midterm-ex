import { Hono } from 'hono'
import mdapi from './Medicine'


const app = new Hono()

app.get('/', (c) => {
  return c.text('67023042 CRUD Medicine \n 🔹 กลุ่มการแพทย์  \n 5. Medicine → MedicineID, Name, Type, Price, Manufacturer, ExpiryDate')
})

app.route('/medicine' , mdapi)

export default app
