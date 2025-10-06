import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Contact persons data
    const contactPersons = [
      { name: "Aditya Sharma", designation: "Founder & CEO", email: "adityash8997@gmail.com", phone: "6372978878", linkedin: "https://www.linkedin.com/in/adityasharma14/", category: "contact" },
      { name: "Samya Sharma", designation: "Co-Founder & CMO", email: "samya2215309@kiit.ac.in", phone: "9437077071", linkedin: "https://www.linkedin.com/in/samya-sharma-72a3a9291?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", category: "contact" },
      { name: "Siddharth Kumar", designation: "Director of Business Operations", email: "siddharth21052914@kiit.ac.in", phone: "8789447047", linkedin: "https://www.linkedin.com/in/siddharth-kumar-9a6b1a2a7?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", category: "contact" },
      { name: "Piyush Kumar", designation: "Chief Technology Officer", email: "piyush21053082@kiit.ac.in", phone: "7488778998", linkedin: "https://www.linkedin.com/in/piyush-kumar-6ba37225a/", category: "contact" },
      { name: "Abhinay Singh", designation: "Director of Strategic Partnerships", email: "abhinaysingh21052638@kiit.ac.in", phone: "7983078111", linkedin: "https://www.linkedin.com/in/abhinay-singh-01b33a326/", category: "contact" },
      { name: "Shreyash Sharan", designation: "Chief Financial Officer", email: "shreyash21053078@kiit.ac.in", phone: "7643896633", linkedin: "https://www.linkedin.com/in/shreyash-sharan-061ba8280/", category: "contact" },
      { name: "Karishma Priya", designation: "Director of Human Resources", email: "karishmapriya21051795@kiit.ac.in", phone: "9431857978", linkedin: "https://www.linkedin.com/in/karishma-priya-89a7a6260/", category: "contact" },
      { name: "Amisha Kannu", designation: "Head of Content Creation", email: "amishakannu21051782@kiit.ac.in", phone: "6203050602", linkedin: "https://www.linkedin.com/in/amisha-kannu-53476b22b/", category: "contact" },
      { name: "Samarth Mishra", designation: "Lead Product Designer", email: "samarthmishra21052961@kiit.ac.in", phone: "8639378949", linkedin: "https://www.linkedin.com/in/samarth-mishra-5a8b1425a/", category: "contact" },
      { name: "Sania Nazeer", designation: "Head of Community Engagement", email: "sanianazeer21051776@kiit.ac.in", phone: "7209663900", linkedin: "https://www.linkedin.com/in/sania-nazeer-b30b21260?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", category: "contact" },
      { name: "Sarthak Dixit", designation: "Director of Events and Sponsorships", email: "sarthakdixit22053113@kiit.ac.in", phone: "7417021143", linkedin: "https://www.linkedin.com/in/sarthak-dixit-8ab0a327a/", category: "contact" },
      { name: "Niharika Priyadarshini", designation: "Head of Brand Strategy and Partnerships", email: "niharika22053029@kiit.ac.in", phone: "9439430449", linkedin: "https://www.linkedin.com/in/niharika-priyadarshini-88a18028b/", category: "contact" },
      { name: "Ayushman Mohanty", designation: "Public Relations Head", email: "ayushman22053091@kiit.ac.in", phone: "8984844144", linkedin: "https://www.linkedin.com/in/ayushman-mohanty-1b1a25244/", category: "contact" },
      { name: "Aryan Kaushik", designation: "Lead Backend Developer", email: "aryan2205146@kiit.ac.in", phone: "7007827028", linkedin: "https://www.linkedin.com/in/aryan-kaushik-a6bb80291/", category: "contact" },
      { name: "Shubhang Tripathi", designation: "Frontend Developer", email: "shubhangtripathi22051951@kiit.ac.in", phone: "9893859695", linkedin: "https://www.linkedin.com/in/shubhang-tripathi-09a6b9287?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", category: "contact" },
      { name: "Aadi Dewangan", designation: "Backend Developer", email: "aadidewangan2205212@kiit.ac.in", phone: "9355099330", linkedin: "https://www.linkedin.com/in/aadi-dewangan-74262a256?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", category: "contact" },
      { name: "Tushar Dhawale", designation: "Data Analyst", email: "tushardhawale22051790@kiit.ac.in", phone: "9356100808", linkedin: "https://www.linkedin.com/in/tushar-dhawale-ba31002b2?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", category: "contact" }
    ];

    // Faculty members data
    const facultyMembers = [
      { name: "Dr. Samaresh Mishra", designation: "Dean, School of Computer Engineering", email: "samaresh.mishrafcs@kiit.ac.in", phone: "0674-272-7777", linkedin: "https://kiit.ac.in/schools/school-of-computer-engineering/faculty-members/", category: "faculty", department: "Computer Science" }
    ];

    const allFacultyData = [...contactPersons, ...facultyMembers];

    // Insert all faculty data
    const { data, error } = await supabase
      .from('faculty_members')
      .upsert(allFacultyData, { onConflict: 'email' });

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully migrated ${allFacultyData.length} faculty members`,
        count: allFacultyData.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
