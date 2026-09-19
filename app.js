
const supabaseUrl = "https://edaxqmayxajztfcsouqg.supabase.co";
const supabaseKey = "sb_publishable_86yyo8GVbSp02Yjxs4CfVQ_HvzKINpH";

const { createClient } = supabase;

const client = createClient(supabaseUrl, supabaseKey);

console.log(client);



let signupBtn = document.querySelector("#btn")
let form = document.querySelector("#formData")
  let signup = document.querySelector("#signupBtn")

 signup && signup.addEventListener("click",(Event)=>{
event.preventDefault()
window.location.href = "./signup.html"
 })

 form && form.addEventListener("submit",(event)=>{
    event.preventDefault()
    const data = new FormData (form)
    const allData = Object.fromEntries (data)
    console.log(allData)

 })
  





