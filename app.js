
const supabaseUrl = "https://edaxqmayxajztfcsouqg.supabase.co";
const supabaseKey = "sb_publishable_86yyo8GVbSp02Yjxs4CfVQ_HvzKINpH";

const { createClient } = supabase;

const client = createClient(supabaseUrl, supabaseKey);

console.log(client);



let signupBtn = document.querySelector("signup")
  