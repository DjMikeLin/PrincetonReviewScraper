let mongoose = require('mongoose');
let Schema = mongoose.Schema;

['Applicants', 'Acceptance Rate', 'Average HS GPA', 'SAT Evidence-Based Reading and Writing', 'SAT Math', 'ACT Composite', 'GPA Breakdown',
'Superscore ACT', 'Superscore SAT', 'ACT Writing Policy', 'SAT Essay Policy', 'Deadlines', 'Academic', 'Non-Academic', 'Admissions selectivity rating', 
'Student/Faculty', 'Total Faculty', 'with Terminal Degree', 'College Makeup', 'Most frequent class size', 'Most frequent lab / sub section size', 
'Professors interesting rating', 'Professors accessible rating', 'Graduation Rates', 'Majors', 'Degrees', 'On-Campus Job Interviews Available', 
'Career Services', 'Opportunities at School', 'Prominent Alumni', 'Academic rating', 'Application Deadlines', 'Notification Date', 'Required Forms',
'Financial Aid Statistics', 'Expenses per Academic Year', 'Financial Aid Methodology', 'Need-Based', 'Non-Need-Based', 'Federal Direct Student Loan Programs', 
'Federal Family Education Loan Programs (FFEL)', 'Is Institutional Employment Available (other than Federal Work Study)', 'Direct Lender', 'Financial Aid Rating',
'Total Undergraduate Enrollment', 'Foreign Countries Represented', 'Race Demographics', 'Other Demographics', 'Undergrads living on campus', 'Help finding off-campus housing',
'Quality of life rating', 'First-Year Students living on campus', 'Campus Environment', 'Fire safety rating', 'Housing Options', 'Program / Service Name', 
'Type of Program', 'Director', 'College Entrance Tests Required', 'Interview Required', 'Documentation Required for LD', 'Documentation Required for ADHD', 
'Special Need Services Offered', 'Registered Student Organizations', 'Number of Honor Societies', 'Number of Social Sororities', 'Number of Religious Organizations',
'% in Sports and Clubs', 'Athletic Division', 'School Has Formal Sustainability Committee', 'Sustainability-focused degree available',
'School employs a sustainability officer', 'Public GHG inventory plan', '% food budget spent on local/organic food', "Men's Sports", "Women's Sports",
'Student Services', 'Green rating', 'AASHE STARS® rating', 'Available Transportation Alternatives', 'Other Information', 'Campus Security Report',
"Starting Median Salary (Up to Bachelor's degree completed only)", "Mid-Career Median Salary (Up to Bachelor's degree completed only)",
"Starting Median Salary (At least Bachelor's degree)", "Mid-Career Median Salary (At least Bachelor's degree)", 'Percent High Job Meaning', 'Percent STEM',
'Students Say', 'Campus Visits Contact', 'Experience College Life', 'Campus Tours', 'On Campus Interview', 'Faculty and Coach Visits', 'Class Visits', 
'Overnight Dorm Stays', 'Transportation']

let schoolSchema = Schema({

});

let SchoolCollection = mongoose.model("schools", schoolSchema);

module.exports = SchoolCollection;
