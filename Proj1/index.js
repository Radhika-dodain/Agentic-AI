import 'dotenv/config';  //runtime mae import krega dotenv ko
import OpenAI from 'openai';
import readlineSync from 'readline-sync'

const client= new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getweatherdetails(city=''){
  if(city.toLowerCase()=='ambala')return '10°C';
  if(city.toLowerCase()=='pune')return '20°C';
  if(city.toLowerCase()=='delhi')return '9°C';   
}

const tools={
  "getweatherdetails": getweatherdetails
}

 //prompt dalo

 const systemprompt= ` 
 You are an AI ASSISTANT WITH START,PLAN,ACTION, OBSERVATION and OUTPUT state.
 Wait for the user input and first PLAN using available tools
 After Planning, take Actions using appropriate tools and wait for observation based on actions
 Once you get observations return AI response based on starting prompt and observation.
 Strictly follow the JSON Output format

 Available Tools:
 - function getweatherdetails (city: string): string
 getweatherdeatils is a function that takes a city name as string input and gives weather details as output

 Example:
START
{"type": "user", "user": "What is sum of temperature at Ambala and Delhi"}
{"type": "plan", "plan": "I will call getweatherdetails function and get temperature of Ambala"}
{"type": "action", "function": "getweatherdetails", "input":"ambala"}
{"type": "observation", "observation": "10°C"}
{"type": "plan", "plan": "I will call getweatherdetails function and get temperature of Delhi"}
{"type": "action", "function": "getweatherdetails", "input":"Delhi"}
{"type": "observation", "observation": "9°C"}
{"type": "output", "output": "The sum of weather of Ambala and Delhi is 19°C"}

 `;

//  const user="is it hot or cold in Ambala today?"

//  async function runchat(){
//  const result= await client.chat.completions.create({
//   model: 'gpt-3.5-turbo',
//   messages: [
//     {"role": 'system', content: systemprompt},
//     {role: 'user', content: user}
//   ],
//  }).then(e => {
//   console.log(e.choices[0].message.content);
//  });
//  }

//  runchat();


//array banayenge to store history
const messages = [
  {role:'system', content: systemprompt}
];

//loop chalao taki from plan to output sab ek baari mae ho

 while(true){

  //terminal ne user query lo and hamare input format mae banao
  const query = readlineSync.question('>> ');
  const q= {
    type: 'user',
    user: query,
  };

  messages.push({"role": "user", content: JSON.stringify(q)});

   while(true){
    const chat =await client.chat.completions.create({
      model : 'gpt-4o',
      messages: messages,
      response_format: {type: 'json_object'},
    });

    const result= chat.choices[0].message.content;
    messages.push({ role: 'assistant', content: result});

     const call= JSON.parse(result)

     if(call.type=="output"){
      console.log(`bot: ${call.output}`);
      break;
     }
     else if(call.type =="action"){
        const fn=tools[call.function]
        const observation= fn(call.input)
        const obs= {"type": "observation", "observation": observation}
        messages.push({role: "developer", content: JSON.stringify(obs)});
     }

   }
 

 }