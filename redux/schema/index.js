import { normalize, schema } from 'normalizr';



const userSchema =  new schema.Entity('user',{
},{ idAttribute: 'user_id' });
const userListSchema =  new schema.Array(userSchema);

const salarySchema =  new schema.Entity('salary',{
},{ idAttribute: 'id' });
const salaryListSchema =  new schema.Array(salarySchema);


const steamingSalarySchema =  new schema.Entity('steaming_salary',{
},{ idAttribute: 'id' });
const steamingSalaryListSchema =  new schema.Array(steamingSalarySchema);

module.exports = {
    
    userSchema : userSchema,
    userListSchema : userListSchema,

    salarySchema : salarySchema,
    salaryListSchema : salaryListSchema,

    steamingSalarySchema : steamingSalarySchema,
    steamingSalaryListSchema  : steamingSalaryListSchema

}