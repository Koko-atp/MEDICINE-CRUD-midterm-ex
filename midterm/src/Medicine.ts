import {Hono}  from 'hono'
import { z } from 'zod';
import { zValidator as zv } from '@hono/zod-validator';


const mdapi = new Hono
const db = (c:any) => c.env.Medicines

const createmdshcma = z.object({
  name: z.string().min(1 , 'Name must be more than 1 charactor'),
  type: z.string(),
  price: z.number().nonnegative(),
  manufac: z.string(),
  exp: z.string().regex(/^\d{4}-\d{2}-\d{2}$/ , 'ExpiryDate must be YYYY-MM-DD')
})

const updatemdshcma = z.object({
  name: z.string().min(1 , 'Name must be more than 1 charactor').optional(),
  type: z.string().optional(),
  price: z.number().nonnegative().optional(),
  manufac: z.string().optional(),
  exp: z.string().regex(/^\d{4}-\d{2}-\d{2}$/ , 'ExpiryDate must be YYYY-MM-DD').optional()
});


mdapi.get('/all' , async (c) => {
    try {
        const allMD = await db(c).prepare( 'SELECT * FROM Medicine').all();
        return c.json(allMD);
    } catch(e:any) {
        return c.json({error : e})
    }
})

mdapi.get('/:id' , async (c) => {
    try {
        const id = c.req.param('id')
        const MD = await db(c).prepare( 'SELECT * FROM Medicine where MedicineID = ?').bind(id).first();
        if (!MD) {
            return c.text("Medicine Not Found")
        }
        return c.json(MD);
    } catch(e:any) {
        return c.json({error : e.message})
    }
})

mdapi.post('/create' ,zv('json' , createmdshcma) , async (c) =>{
    try {
        const nmd = c.req.valid('json')
        const cst  = await db(c).prepare(
            `INSERT INTO Medicine (Name , Type , Price , Manufacturer , ExpiryDate)
            VALUES(?,?,?,?,?)`
        ).bind(
            nmd.name,
            nmd.type,
            nmd.price,
            nmd.manufac,
            nmd.exp,
        ).run();
        return c.json({status : "created!" , meta : cst.meta})
    }catch(e:any){
        return c.json({error : e.message})
    }
})

mdapi.put('/update/:id' , zv('json' , updatemdshcma) ,async (c)=> {
    try{
        const id = c.req.param('id');
        const schema = c.req.valid('json');
        const upd = await db(c).prepare(`
            UPDATE Medicine
            SET 
            Name = COALESCE(NULLIF(?, ''), Name),
            Type = COALESCE(NULLIF(?, ''), Type),
            Price = COALESCE(?, Price),
            Manufacturer = COALESCE(NULLIF(?, ''), Manufacturer),
            ExpiryDate = COALESCE(NULLIF(?, ''), ExpiryDate)
            WHERE MedicineID = ?; `
         ).bind(
            schema.name?? null,
            schema.type ?? null,
            schema.price ?? null,
            schema.manufac ?? null,
            schema.exp ?? null,
            id ).run();

        if (upd.meta.changes === 0) {
            return c.json({ error: 'Medicine not found' }, 404);
        }
        return c.json({ success: true, changes: upd.meta.changes });
    }catch(e : any){ return c.json({error : e.message}) }
})

mdapi.delete('delete/:id' , async (c) => {
    try{
        const id =  c.req.param('id')
        const del = await db(c).prepare(`DELETE FROM Medicine WHERE MedicineID = ?`).bind(id).run()
        if (del.meta.changes === 0) {
            return c.json({ error: 'Medicine not found' }, 404);
        }
        return c.json({
            success: true,
            deleted: del.meta.changes
        });

    }catch(e : any) { return  c.json({ error : e.message})}

})
export default mdapi