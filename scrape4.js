//Column names for the .csv
const columnNames = ['Applicants', 'Acceptance Rate', 'Average HS GPA', 'SAT Evidence-Based Reading and Writing', 'SAT Math', 'ACT Composite', 'GPA Breakdown',
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
'Overnight Dorm Stays', 'Transportation'];

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
var HashMap = require('hashmap');
var csvWriter = require('csv-write-stream');
var writer = csvWriter({ headers: ['School Name'].concat(columnNames)});

(async function main() {
	try{
		writer.pipe(fs.createWriteStream('missingSchools.csv'));

		const browser = await puppeteer.launch({ headless: true });
	  	const page = await browser.newPage();
	  	await page.goto('https://www.princetonreview.com/college/california-state-university--fresno-1023476');
		await page.waitForSelector('.row');
		//Creates a HashMap to keep track of columns(key) and content(value)
		var colMap = new HashMap();
		//Start of Admissions Tab
		//Grabs any 'Applicants', 'Acceptance Rate', 'Average HS GPA', 'SAT Evidence-Based Reading and Writing',
		//'SAT Math', and 'ACT Composite'
		const overviewAndTestScores = await page.$$eval('#admissions > .row > .col-sm-9 > .row > .col-sm-4',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.bold') !== null && element.querySelector('.bold').innerText === "Applicants")
		        	return{
		        		key: element.querySelector('.bold').innerText,
		        		value: element.querySelector('.number-callout').innerText
		        	};
    	        else if(element.querySelector('.bold') !== null && element.querySelector('.bold').innerText === "Acceptance Rate")
		        	return{ 
		        		key: element.querySelector('.bold').innerText,
		        		value: element.querySelector('.number-callout').innerText
		        	};
    	        else if(element.querySelector('.bold') !== null && element.querySelector('.bold').innerText === "Average HS GPA")
		        	return{ 
		        		key: element.querySelector('.bold').innerText,
		        		value: element.querySelector('.number-callout').innerText
		        	};
    	        else if(element.querySelector('div') !== null && element.querySelector('div').innerText === "SAT Evidence-Based Reading and Writing")
		        	return{ 
		        		key: element.querySelector('div').innerText,
		        		value: element.querySelector('.number-callout').innerText
		        	};
    	        else if(element.querySelector('div') !== null && element.querySelector('div').innerText === "SAT Math")
		        	return{ 
		        		key: element.querySelector('div').innerText,
		        		value: element.querySelector('.number-callout').innerText
		        	};
    	        else if(element.querySelector('div') !== null && element.querySelector('div').innerText === "ACT Composite")
		        	return{ 
		        		key: element.querySelector('div').innerText,
		        		value: element.querySelector('.number-callout').innerText
		        	};
	        })    
	    );
	    addToMap(colMap, overviewAndTestScores);
	    //Grabs any 'GPA Breakdown'
		var gpaBreakdown = await page.$$eval('#admissions > .row > .col-sm-9 > .row > .col-sm-4 > .row.graph-row-container.gpa-chart-data',
		    nodes =>
		        nodes.map(element => {
		        	if(element.querySelector('.col-xs-5.col-sm-2.bold') !== null)
			        	return element.querySelector('.col-xs-5.col-sm-2.bold').innerText + ": " + 
			        	element.querySelector('.col-xs-5.col-sm-7.bold').innerText;
		        })    
		    );
		gpaBreakdown = (gpaBreakdown.length === 0) ? '' : gpaBreakdown.join('\n');
		colMap.set('GPA Breakdown', gpaBreakdown);
		//Grabs any 'Superscore ACT', 'Superscore SAT'
		const superScores = await page.$$eval('#admissions > .row > .col-sm-9 > .row > .col-xs-6',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('div > a') !== null && element.querySelector('div > a').innerText === "Superscore ACT")
		        	return{
		        		key: element.querySelector('div > a').innerText,
		        		value: element.querySelector('.number-callout').innerText
		        	};
	        	else if(element.querySelector('div > a') !== null && element.querySelector('div > a').innerText === "Superscore SAT")
		        	return{
		        		key: element.querySelector('div > a').innerText,
		        		value: element.querySelector('.number-callout').innerText
		        	};
	        })    
	    );
	    addToMap(colMap, superScores);
		//Grabs any 'ACT Writing Policy', 'SAT Essay Policy',
		const readAndWritePolicies = await page.$$eval('#admissions > .row > .col-sm-9 > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-xs-7.col-sm-7') !== null && element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === "ACT Writing Policy")
		        	return{
		        		key: element.querySelector('.col-xs-7.col-sm-7').innerText,
		        		value: element.querySelector('.col-xs-5.col-sm-5.text-right > .bold').innerText
		        	};
	        	else if(element.querySelector('.col-xs-7.col-sm-7') !== null && element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === "SAT Essay Policy")
		        	return{
		        		key: element.querySelector('.col-xs-7.col-sm-7').innerText,
		        		value: element.querySelector('.col-xs-5.col-sm-5.text-right > .bold').innerText
		        	};
	        })    
	    );
	    addToMap(colMap, readAndWritePolicies);
		//Grab any deadlines for applications 
		var deadlines = await page.$$eval('#admissions > .row > .col-sm-9 > p',
	      nodes =>
	        nodes.map(element => {
	        	return element.innerText;
	        })    
	    );
	    deadlines = (deadlines.length === 0) ? '' : deadlines.join('\n');
	    colMap.set('Deadlines', deadlines);
	    //Grab any 'Academic', 'Non-Academic',
		const otherAdmissionFactors = await page.$$eval('#admissions > .row > .col-sm-9 > .row > .col-sm-6',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.bold') !== null && element.querySelector('.bold').innerText === "Academic")
	        		return{ 
	        			key: element.querySelector('.bold').innerText,
	        			value: element.innerText.substring(9)
	        		};
	        	else if(element.querySelector('.bold') !== null && element.querySelector('.bold').innerText === "Non-Academic")
	        		return{ 
	        			key: element.querySelector('.bold').innerText,
	        			value: element.innerText.substring(13)
	        		};
	        })    
	    );
		addToMap(colMap, otherAdmissionFactors);
		//Grab any 'Admissions selectivity rating'
		var selectivityRating = await page.$$eval('#admissions > .row > .col-sm-9 > .row > .col-sm-6 > .number-callout',
	      nodes =>
	        nodes.map(element => {
	        	return element.innerText.trim();
	        })    
	    );
	    selectivityRating = (selectivityRating.length === 0) ? '' : selectivityRating[0].toString();
		colMap.set('Admissions selectivity rating', selectivityRating);
		//End of Admissions tab; start of Academics tab
		//Grabs any student:faculty ratio, total faculty, and num with terminal degree from Faculty and Class information row
		//Replace ':' with ' to ' to stop .csv from automatically converting ratio to time
		const facultyStudentInfo1 = await page.$$eval('#academics > .row > .col-sm-9 > .row > .col-sm-4',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('div') !== null){
	        		if(element.querySelector('div').innerText === "Student/Faculty" ||
	        		   element.querySelector('div').innerText === "Total Faculty" ||
	        		   element.querySelector('div').innerText === "with Terminal Degree")
		        		return{ 
		        			key: element.querySelector('div').innerText,
		        			value: element.querySelector('.number-callout').innerText.replace(':', ' to ')
		        		};
	        	}
	        })    
	    );
		addToMap(colMap, facultyStudentInfo1);
		//Grab any college makeup. Made include how many women, men, minority, international, and etc 
		var facultyStudentInfo2 = await page.$$eval('#academics > .row > .col-sm-9 > .row.graph-row-container',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-xs-2.col-sm-2.bold') !== null && element.querySelector('.col-xs-5.col-sm-3') !== null)
	        		return element.querySelector('.col-xs-5.col-sm-3').innerText.trim() + ' - ' + element.querySelector('.col-xs-2.col-sm-2.bold').innerText.trim();
	        })    
	    );
	    facultyStudentInfo2 = (facultyStudentInfo2.length === 0) ? '' : facultyStudentInfo2.join('\n');
	    colMap.set('College Makeup', facultyStudentInfo2);
	    //Grabs any 'Most frequent class size', 'Most frequent lab / sub section size', 'Professors interesting rating', or 'Professors accessible rating'
		//Replaced '-' with 'to' to stop csv from converting text to date
		const facultyStudentInfo3 = await page.$$eval('#academics > .row > .col-sm-9 > .row > .col-xs-6',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('div') !== null){
	        		if(element.querySelector('div').innerText === "Most frequent class size" ||
	        		   element.querySelector('div').innerText === "Most frequent lab / sub section size")
		        		return{ 
		        			key: element.querySelector('div').innerText,
		        			value: element.querySelector('.number-callout').innerText.replace('-', 'to')
		        		};
		        	else if(element.querySelector('div > a') !== null && element.querySelector('.number-callout') !== null){
						if(element.querySelector('div > a').innerText === 'Professors interesting rating' ||
						   element.querySelector('div > a').innerText === 'Professors accessible rating')
							return{
								key: element.querySelector('div > a').innerText,
								value: element.querySelector('.number-callout').innerText.trim()
							};
					}
	        	}
	        })    
	    );
		addToMap(colMap, facultyStudentInfo3);
		//Grabs any 'Graduation Rates' 
		var graduationRates = await page.$$eval('#academics > .row > .col-sm-9 > .row > .col-sm-4',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('div') !== null && element.querySelector('.number-callout') !== null){
	        		if(element.querySelector('div').innerText === "Graduate in 4 years" ||
	        		   element.querySelector('div').innerText === "Graduate in 5 years" ||
	        		   element.querySelector('div').innerText === "Graduate in 6 years")
		        		return element.querySelector('div').innerText + ' : ' + element.querySelector('.number-callout').innerText;
	        	}
	        })    
	    );
	    graduationRates = (graduationRates.length === 0) ? '' : graduationRates.join('\n');
	    colMap.set('Graduation Rates', graduationRates);	
	    //Grab any 'Majors' and major categories
		var majors = await page.$$eval('#academics > .row > .col-sm-9 > div > .list-unstyled',
	      nodes =>
	        nodes.map(element => {
	        	return element.innerText;
	        })    
	    );
	    majors = (majors.length === 0) ? '' : majors.join('\n');
	    colMap.set('Majors', majors);
	    //Grabs any 'Degrees' offered
		const degrees = await page.$$eval('#academics > .row',
	      nodes =>
	        nodes.map(element => {//if there is a row called 'Degrees'
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'Degrees'){
	        		if(element.querySelector('.col-sm-9 > .blurb') !== null)
	        			return{ 
	        				key: element.querySelector('.col-sm-3 > h4').innerText,
	        				value: element.querySelector('.col-sm-9 > .blurb').innerText
	        			};
	        	}
	        })    
	    );
		addToMap(colMap, degrees);
		//Grabs information regarding 'On-Campus Job Interviews Available' if it exists
		const onCampusJobInterview = await page.$$eval('#academics > .row > .col-sm-9 > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-xs-7.col-sm-7') !== null && element.querySelector('.col-xs-5.col-sm-5.text-right > .bold') !== null && 
	        	   element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === 'On-Campus Job Interviews Available')
        			return{ 
        				key: element.querySelector('.col-xs-7.col-sm-7').innerText.trim(),
        				value: element.querySelector('.col-xs-5.col-sm-5.text-right > .bold').innerText
        			};
	        })    
	    );
		addToMap(colMap, onCampusJobInterview);
		//Grabs any 'Career Services' and 'Opportunities at School'
		const careerServices = await page.$$eval('#academics > .row > .col-sm-9 > .row > .col-sm-6',
	      nodes =>
	        nodes.map(element => {
        		if(element.querySelector('.bold') !== null){
        		 	if(element.querySelector('.bold').innerText === 'Career Services' || element.querySelector('.bold').innerText === 'Opportunities at School')
        		 		return{
        		 			key: element.querySelector('.bold').innerText,
        		 			value: element.innerText.trim().substring(element.querySelector('.bold').innerText.length + 2)//removes column name from string
        		 		};
	    		}
	        })    
	    );
	    addToMap(colMap, careerServices);
	    //Grabs any 'Prominent Alumni' 
		var prominentAlumni = await page.$$eval('#academics > .row > .col-sm-9 > .row',
	      nodes =>
	        nodes.map(element => {
        		if(element.querySelector('.col-xs-7.col-sm-7') !== null && element.querySelector('.col-xs-5.col-sm-5.text-right > .bold') !== null)
    		 		return element.querySelector('.col-xs-7.col-sm-7').innerText.trim() + ' : ' + element.querySelector('.col-xs-5.col-sm-5.text-right > .bold').innerText.trim();
	        })    
	    );
	    prominentAlumni = (prominentAlumni.length === 0) ? '' : prominentAlumni.join('\n');
	    colMap.set('Prominent Alumni', prominentAlumni);
	    //Grabs 'Academic rating' if it exists
		const academicRating = await page.$$eval('#academics > .row > .col-sm-9 > .row > .col-sm-6',
	      nodes =>
	        nodes.map(element => {
        		if(element.querySelector('div > a') !== null && element.querySelector('.number-callout') !== null && 
        		   element.querySelector('div > a').innerText === 'Academic rating')
    		 		return{
    		 			key: element.querySelector('div > a').innerText,
    		 			value: element.querySelector('.number-callout').innerText.trim()
    		 		};
	        })    
	    );
		addToMap(colMap, academicRating);
		//End of Academics tab; start of Tuition & Aid tab
		//Grabs any 'Application Deadlines' and 'Notification Date'
		const dates = await page.$$eval('#tuition > .row > .col-sm-9 > .row > .col-sm-4',
	      nodes =>
	        nodes.map(element => {
        		if(element.querySelector('div') !== null && element.querySelector('.number-callout') !== null){
    		 		if(element.querySelector('div').innerText === 'Application Deadlines' || element.querySelector('div').innerText === 'Notification Date')
	    		 		return{
	    		 			key: element.querySelector('div').innerText,
	    		 			value: element.querySelector('.number-callout').innerText
	    		 		};
    		 	}
	        })    
	    );
	    addToMap(colMap, dates);
	    //Grabs any 'Required Forms'
		const requiredForms = await page.$$eval('#tuition > .row',
	      nodes =>
	        nodes.map(element => {//if there is a row called 'Degrees'
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'Required Forms'){
	        		if(element.querySelector('.col-sm-9 > .blurb') !== null)
	        			return{ 
	        				key: element.querySelector('.col-sm-3 > h4').innerText,
	        				value: element.querySelector('.col-sm-9 > .blurb').innerText.trim()
	        			};
	        	}
	        })    
	    );
	    addToMap(colMap, requiredForms);
	    //Grabs any 'Financial Aid Statistics'
		var financialAidStats = await page.$$eval('#tuition > .row > .col-sm-9 > .row',
	      nodes =>
	        nodes.map(element => {
        		if(element.querySelector('.col-xs-7.col-sm-7') !== null && element.querySelector('.col-xs-5.col-sm-5.text-right > .number-callout') !== null)
    		 		return element.querySelector('.col-xs-7.col-sm-7').innerText.trim() + ' : ' + element.querySelector('.col-xs-5.col-sm-5.text-right > .number-callout').innerText;
	        })    
	    );
	    financialAidStats = (financialAidStats.length === 0) ? '' : financialAidStats.join('\n');
	    colMap.set('Financial Aid Statistics', financialAidStats);
	    //Grabs any 'Expenses per Academic Year'
		const expensesPerYear = await page.$$eval('#tuition > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'Expenses per Academic Year')
        			return{
        				key: element.querySelector('.col-sm-3 > h4').innerText,
        			 	value: element.querySelector('.col-sm-9').innerText.trim()
        			}
	        })    
	    );
	    addToMap(colMap, expensesPerYear);
	    //Grabs any 'Financial Aid Methodology'
		const financialAidMethodology = await page.$$eval('#tuition > .row > .col-sm-9 > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-sm-6 > .bold') !== null && element.querySelector('.col-sm-6 > .bold').innerText === 'Financial Aid Methodology')
        			return{
        				key: element.querySelector('.col-sm-6 > .bold').innerText,
        			 	value: element.querySelector('.col-sm-6').innerText.trim()
        			}
	        })    
	    );
	    addToMap(colMap, financialAidMethodology);
	    //Grabs any 'Need-Based' and 'Non-Need-Based' Scholarships and Grants
		const needOrNonNeed = await page.$$eval('#tuition > .row > .col-sm-9 > .row > .col-sm-6',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('div') !== null && element.querySelector('.narrow') !== null)
        			return{
        				key: "Need-Based",
        			 	value: element.innerText.trim()
        			}
	        	else if(element.innerText.includes("non-need-based"))
        			return{
        				key: "Non-Need-Based",
        			 	value: element.querySelector('div').innerText.trim()
        			}
	        })    
	    );
		addToMap(colMap, needOrNonNeed);
		//Grabs any 'Federal Direct Student Loan Programs', 'Federal Family Education Loan Programs (FFEL)',
		//'Is Institutional Employment Available (other than Federal Work Study)', 'Direct Lender',
		const availableAid = await page.$$eval('#tuition > .row > .col-sm-9 > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-sm-6 > span.bold') !== null){
	        		if(element.querySelector('.col-sm-6 > span.bold').innerText === 'Federal Direct Student Loan Programs' ||
	        		   element.querySelector('.col-sm-6 > span.bold').innerText === 'Federal Family Education Loan Programs (FFEL)' ||
	        		   element.querySelector('.col-sm-6 > span.bold').innerText === 'Is Institutional Employment Available (other than Federal Work Study)' ||
	        		   element.querySelector('.col-sm-6 > span.bold').innerText === 'Direct Lender')
	        			return{//removes 'Federal Direct Student Loan Programs' from value and extra spaces
	        				key: element.querySelector('span.bold').innerText,
	        			 	value: element.innerText.trim().substring(element.querySelector('span.bold').innerText.length + 2).trim()
	        			}
	        	}
	        })    
	    );
		addToMap(colMap, availableAid);
		//Grabs any 'Financial Aid Rating'
		const financialAidRating = await page.$$eval('#tuition > .row > .col-sm-9 > .row > .col-sm-6',
	      nodes =>
	        nodes.map(element => {
        		if(element.querySelector('div > a') !== null && element.querySelector('.number-callout') !== null && 
        		   element.querySelector('div > a').innerText === 'Financial Aid Rating')
    		 		return{
    		 			key: element.querySelector('div > a').innerText,
    		 			value: element.querySelector('.number-callout').innerText.trim()
    		 		};
	        })    
	    );
		addToMap(colMap, financialAidRating);
		//End of Tuition & Aid tab; start of Student Body tab
		//Grabs any 'Total Undergraduate Enrollment', 'Foreign Countries Represented',
		const studentBodyProfile = await page.$$eval('#studentbody > .row > .col-sm-9 > .row > .col-xs-6',
	      nodes =>
	        nodes.map(element => {
        		if(element.querySelector('div') !== null && element.querySelector('.number-callout') !== null){ 
        		   if(element.querySelector('div').innerText === 'Total Undergraduate Enrollment' ||
        		   	  element.querySelector('div').innerText === 'Foreign Countries Represented')
	    		 		return{
	    		 			key: element.querySelector('div').innerText,
	    		 			value: element.querySelector('.number-callout').innerText
	    		 		};
    		 	}
	        })    
	    );
	    addToMap(colMap, studentBodyProfile);
	    //Grabs any 'Race Demographics'
		var raceDemographics = await page.$$eval('#studentbody > .row > .col-sm-9 > div > .row.graph-row-container',
	      nodes =>
	        nodes.map(element => {
        		if(element.querySelector('.col-xs-2.col-sm-2.bold') !== null && element.querySelector('.col-xs-5.col-sm-3') !== null)
        			return element.querySelector('.col-xs-5.col-sm-3').innerText.trim() + ' : ' + element.querySelector('.col-xs-2.col-sm-2.bold').innerText.trim();
	        })    
	    );
	    raceDemographics = (raceDemographics.length === 0) ? '' : raceDemographics.join('\n');
	    colMap.set('Race Demographics', raceDemographics);
	    //Grabs any 'Other Demographics' beside race demographics
		var otherDemographics = await page.$$eval('#studentbody > .row > .col-sm-9 > .row.graph-row-container > .col-xs-12 > .row',
	      nodes =>
	        nodes.map(element => {
        		if(element.querySelector('.col-xs-6') !== null){
        			if(element.querySelector('.col-xs-6.text-right') !== null)
        				return element.querySelector('.col-xs-6').innerText.trim() + ' vs ' + element.querySelector('.col-xs-6.text-right').innerText.trim();
	        		return element.querySelector('.col-xs-6').innerText.trim();//return .col-xs-6 if .col-xs-6.text-right' is null
	        	}
	        })    
	    );
	    otherDemographics = (otherDemographics.length === 0) ? '' : otherDemographics.join('\n');
	    colMap.set('Other Demographics', otherDemographics);
	    //End of Student Body tab; start of Campus Life tab
	    //Grabs any 'Undergrads living on campus', 'Help finding off-campus housing', 'Quality of life rating', 'First-Year Students living on campus'
	    //'Campus Environment', and 'Fire safety rating'
		const campusLife = await page.$$eval('#campuslife > .row > .col-sm-9 > .row > .col-xs-6',
	      nodes =>
	        nodes.map(element => {
	    		if(element.querySelector('div > a') !== null && element.querySelector('div.number-callout') !== null){ 
	    		 	if(element.querySelector('div > a').innerText === 'Quality of life rating' ||
	    		 			element.querySelector('div > a').innerText === 'Fire safety rating')
	    		 		return{
	    		 			key: element.querySelector('div > a').innerText,
	    		 			value: element.querySelector('div.number-callout').innerText.trim()
	    		 		};
    		 	}
        		else if(element.querySelector('div') !== null && element.querySelector('div.number-callout') !== null){ 
        		   if(element.querySelector('div').innerText === 'Undergrads living on campus' ||
        		   	  element.querySelector('div').innerText === 'Help finding off-campus housing' ||
        		   	  element.querySelector('div').innerText === 'First-Year Students living on campus' ||
        		   	  element.querySelector('div').innerText === 'Campus Environment')
	    		 		return{
	    		 			key: element.querySelector('div').innerText,
	    		 			value: element.querySelector('div.number-callout').innerText
	    		 		};
	    		}
	        })    
	    );
	    addToMap(colMap, campusLife);
	    //Grabs any 'Housing Options' 
		const housingOptions = await page.$$eval('#campuslife > .row',
	      nodes =>
	        nodes.map(element => {//checks to see if current row is 'Housing Options'
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'Housing Options')
	        		return{
	        		 	key: element.querySelector('.col-sm-3 > h4').innerText,
	        		 	value: element.querySelector('.col-sm-9 > .row').innerText.trim()
	        		}
	        })    
	    );
	    addToMap(colMap, housingOptions);
	    //Grabs any 'Program / Service Name', 'Type of Program', 'Director', 'College Entrance Tests Required', and 'Interview Required'
		const specialNeedsAdmissions = await page.$$eval('#campuslife > .row > .col-sm-9 > .row',
	      nodes =>
	        nodes.map(element => {
		        if(element.querySelector('.col-xs-7.col-sm-7') !== null && element.querySelector('.col-xs-5.col-sm-5.text-right') !== null){
		        	if(element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === 'Program / Service Name' ||
		        	   element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === 'Type of Program' ||
		        	   element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === 'Director' ||
		        	   element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === 'College Entrance Tests Required' ||
		        	   element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === 'Interview Required')
	        			return{
	        			 	key: element.querySelector('div.col-xs-7.col-sm-7').innerText.trim(),
	        				value: element.querySelector('div.col-xs-5.col-sm-5.text-right > div.bold').innerText.trim()
	        			};
	        	}
	        })    
	    );
	    addToMap(colMap, specialNeedsAdmissions);
	    //Grabs any documentation from Special Needs Admissions
		const specialNeedsDocumentation = await page.$$eval('#campuslife > .row > .col-sm-9 > strong',
	      nodes =>
	        nodes.map(element => {
	        	return element.innerText.trim();
	        })    
	    );
	    colMap.set('Documentation Required for LD', specialNeedsDocumentation[0]);
	    colMap.set('Documentation Required for ADHD', specialNeedsDocumentation[1]);
	    //Grabs any 'Special Need Services Offered'
		const specialNeedsServices = await page.$$eval('#campuslife > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'Special Need Services Offered')
	        		return{
	        			key: element.querySelector('.col-sm-3 > h4').innerText,
	        		 	value: element.querySelector('.col-sm-9').innerText.trim().replace(/\t*\n*/g, '').replace(/Yes/g, ': Yes\n').replace(/No/g, ': No\n')
	        		};
	        })    
	    );
		addToMap(colMap, specialNeedsServices);
	    //Grabs any 'Registered Student Organizations', 'Number of Honor Societies', 'Number of Social Sororities', and 'Number of Religious Organizations'
		const studentActivities = await page.$$eval('#campuslife > .row > .col-sm-9 > .row > .col-xs-6',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('div') !== null && element.querySelector('.number-callout') !== null)
	        		if(element.querySelector('div').innerText === 'Registered Student Organizations' ||
	        		   element.querySelector('div').innerText === 'Number of Honor Societies' ||
	        		   element.querySelector('div').innerText === 'Number of Social Sororities' ||
	        		   element.querySelector('div').innerText === 'Number of Religious Organizations')
		        		return{
		        			key: element.querySelector('div').innerText,
		        		 	value: element.querySelector('.number-callout').innerText
		        		};
	        })    
	    );
		addToMap(colMap, studentActivities);
		//Grabs any '% in Sports and Clubs'
		var percentInClubAndSports = await page.$$eval('#campuslife > .row > .col-sm-9 > .row.graph-row-container > .col-xs-12 > .row > .col-xs-6',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('span.bold') !== null)
	        		return element.innerText.trim();
	        })    
	    );
	    percentInClubAndSports = (percentInClubAndSports.length === 0) ? '' : percentInClubAndSports.join('\n');
	    colMap.set('% in Sports and Clubs', percentInClubAndSports);
	    //Grabs any 'Athletic Division', 'School Has Formal Sustainability Committee', 'Sustainability-focused degree available',
	    //'School employs a sustainability officer', 'Public GHG inventory plan', '% food budget spent on local/organic food'
		const divisionAndSustainability = await page.$$eval('#campuslife > .row > .col-sm-9 > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-xs-7.col-sm-7') !== null && element.querySelector('.col-xs-5.col-sm-5.text-right > .bold') !== null)
	        	   if(element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === 'Athletic Division' ||
	        	   	  element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === 'School Has Formal Sustainability Committee' ||
	        	   	  element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === 'Sustainability-focused degree available' ||
	        	   	  element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === 'School employs a sustainability officer' ||
	        	   	  element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === 'Public GHG inventory plan' ||
	        	   	  element.querySelector('.col-xs-7.col-sm-7').innerText.trim() === '% food budget spent on local/organic food')
		        		return{
		        			key: element.querySelector('.col-xs-7.col-sm-7').innerText.trim(),
		        			value: element.querySelector('.col-xs-5.col-sm-5.text-right > .bold').innerText
		        		};
	        })    
	    );
	    addToMap(colMap, divisionAndSustainability);
	    //Grabs any "Men's Sports" and "Women's Sports"
		const whatSports = await page.$$eval('#campuslife > .row > .col-sm-9 > .row > .col-xs-6',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.bold') !== null && element.querySelector('.number-callout') !== null) 
	        		if(element.querySelector('.bold').innerText.includes("Men's Sports"))//if the column is Men's Sports
		        		return{//value will only contain sport names and '\n'
		        			key: "Men's Sports",
		        		 	value: element.innerText.trim().substring(element.querySelector('.bold').innerText.length + 28)
		        		};
		        	else if(element.querySelector('.bold').innerText.includes("Women's Sports"))//if the column is Women's Sports
		        		return{//value will only contain sport names and '\n'
		        			key: "Women's Sports",
		        		 	value: element.innerText.trim().substring(element.querySelector('.bold').innerText.length + 28)
		        		};
	        })    
	    );
		addToMap(colMap, whatSports);
		//Grabs any 'Student Services' offered
		const studentServices = await page.$$eval('#campuslife > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'Student Services') 
	        		return{//value will only contain sport names and '\n'
	        			key: element.querySelector('.col-sm-3 > h4').innerText,
	        		 	value: element.querySelector('.col-sm-9').innerText.trim()
	        		};
	        })    
	    );
	    addToMap(colMap, studentServices);
	    //Grabs any 'Green rating' and 'AASHE STARS® rating'
		const sustainabilityRatings = await page.$$eval('#campuslife > .row > .col-sm-9 > .row > .col-xs-6',
	      nodes =>
	        nodes.map(element => {
		       	if(element.querySelector('.number-callout') !== null && element.querySelector('span') !== null){
		       		if(element.querySelector('.number-callout').innerText === 'AASHE STARS® rating') 
		        		return{
		        			key: element.querySelector('.number-callout').innerText,
		        		 	value: element.querySelector('span').innerText
		        		};
       			}

	        	if(element.querySelector('div > a') !== null && element.querySelector('.number-callout') !== null){
        		   	if(element.querySelector('div > a').innerText === 'Green rating') 
		        		return{
		        			key: element.querySelector('div > a').innerText,
		        		 	value: element.querySelector('.number-callout').innerText.trim()
		        		};
	        	}
	        })    
	    );
	    addToMap(colMap, sustainabilityRatings);
	    //Grabs blurb lists from page
		const blurbLists = await page.$$eval('#campuslife > .row > .col-sm-9 > .blurb-list',
	      nodes =>
	        nodes.map(element => {
	        	return element.innerText.trim().replace(/\t*\n*/g, '').replace(/Yes/g, ': Yes\n').replace(/No/g, ': No\n');
	        })    
	    );
		//Finds if blurbLists contain 'Available Transportation Alternatives' and 'Other Information' and add thems to HashMap
	    for(list of blurbLists){
	    	if(list.substring(0, 10) === "Bike Share")
	    		colMap.set('Available Transportation Alternatives', list);
	    	else if(list.substring(0, 28) === "Campus-wide Internet Network")
	    		colMap.set('Other Information', list);
	    }
	    //Garbs any 'Campus Security Report'
		const campusSecurityReport = await page.$$eval('#campuslife > .row > .col-sm-9',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('a') !== null && element.querySelector('a').innerText === 'Campus Security Report'){
	        		return{ 
	        			key: element.querySelector('a').innerText,
	        			value: element.querySelector('a').getAttribute('href') + '\n' + element.innerText.trim().replace('Campus Security Report', '')
        			}
	        	}
	        })    
	    );
	    addToMap(colMap, campusSecurityReport)
	    //End of Campus Life tab; start of Careers tab
	    //Grabs any 'Starting Median Salary (Up to Bachelor's degree completed only)', 'Mid-Career Median Salary (Up to Bachelor's degree completed only)',
	    //'Starting Median Salary (At least Bachelor's degree)', 'Mid-Career Median Salary (At least Bachelor's degree)',
	    //'Percent High Job Meaning', and 'Percent STEM'. Might grab other stuff as well
		const ROIandOutcomes = await page.$$eval('#careers > .row > .col-sm-9 > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-xs-7.col-sm-7') !== null && element.querySelector('.col-xs-5.col-sm-5.text-right > .bold') !== null)
	        		return{ 
	        			key: element.querySelector('.col-xs-7.col-sm-7').innerText.trim().replace(',', ''),
	        			value: element.querySelector('.col-xs-5.col-sm-5.text-right > .bold').innerText
        			}
        		else if(element.querySelector('.col-sm-6 > div > a') !== null && element.querySelector('.col-sm-6 > .number-callout') !== null &&
        			    element.querySelector('.col-sm-6 > div > a').innerText === 'Return on Investment (ROI) rating')
        			return{
        				key: element.querySelector('.col-sm-6 > div > a').innerText,
        				value: element.querySelector('.col-sm-6 > .number-callout').innerText
        			};
	        })    
	    );
	    addToMap(colMap, ROIandOutcomes);
	    //Grabs any blurb from 'Students Say' Assuming Careers tab only has one blurb
		const studentSays = await page.$$eval('#careers > .row > .col-sm-9 > .blurb',
	      nodes =>
	        nodes.map(element => {
	        	return{
	        		key: 'Students Say',
	        		value: element.innerText
	        	}
	        })    
	    );
	    addToMap(colMap, studentSays);
		//End of Careers Tab; start of Visiting Tab
		//Grabs any 'Campus Visits Contact'
		const campusVisitsContact = await page.$$eval('#visiting > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'Campus Visits Contact')
	        		return{ 
	        			key: element.querySelector('.col-sm-3 > h4').innerText,
	        			value: element.querySelector('.col-sm-9').innerText.trim().replace(/\t*\n*/g, '')
	        			   		.replace("Address", "\nAddress: ").replace("Contact", "\nContact: ")
	        			   		.replace("Phone", "\nPhone: ").replace("Email", "\nEmail: ")
        			};
	        })    
	    );
	    addToMap(colMap, campusVisitsContact);
	    //Grabs any 'Experience College Life'
		const experienceCollegeLife = await page.$$eval('#visiting > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'Experience College Life')
	        		return{ 
	        			key: element.querySelector('.col-sm-3 > h4').innerText,
	        			value: element.querySelector('.col-sm-9').innerText.trim().replace(/\t*\n*/g, '')
	        			   		.replace("Most Popular Places On Campus", "Most Popular Places On Campus:\n")
	        			   		.replace("Most Popular Places Off Campus", "\n\nMost Popular Places Off Campus:\n")
        			};
	        })    
	    );	    
		addToMap(colMap, experienceCollegeLife);
		//Grabs any 'Campus Tours'
		const campusTours = await page.$$eval('#visiting > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'Campus Tours')
	        		return{ 
	        			key: element.querySelector('.col-sm-3 > h4').innerText,
	        			value: element.querySelector('.col-sm-9').innerText.trim().replace(/\t*\n*/g, '')
	        			   		.replace("Campus Visiting Center", "Campus Visiting Center:\n")
	        			   		.replace("Campus Tours", "\n\nCampus Tours:\n")
        			};
	        })    
	    );
		addToMap(colMap, campusTours);
		//Grabs any 'On Campus Interview'
		const onCampusInterview = await page.$$eval('#visiting > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'On Campus Interview')
	        		return{ 
	        			key: element.querySelector('.col-sm-3 > h4').innerText,
	        			value: element.querySelector('.col-sm-9').innerText.trim().replace(/\t*\n*/g, '')
	        			   		.replace("Campus Interviews", "Campus Interviews: ")
	        			   		.replace("Information Sessions", "\nInformation Sessions: ")
	        			   		.replace("Times", "\nTimes: ")
        			};
	        })    
	    );
	    addToMap(colMap, campusTours);
	    //Grabs any 'Faculty and Coach Visits'
		const facultyAndCoachVisits = await page.$$eval('#visiting > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'Faculty and Coach Visits')
	        		return{ 
	        			key: element.querySelector('.col-sm-3 > h4').innerText,
	        			value: element.querySelector('.col-sm-9').innerText.trim().replace(/\t*\n*/g, '')
	        			   		.replace("Dates/Times Available", "Dates/Times Available: ")
	        			   		.replace("Arrangements", "\nArrangements: ")
	        			   		.replace("Contact Email Address for Visit", "\nContact Email Address for Visit: ")
	        			   		.replace("Advance Notice", "\nAdvance Notice: ")
        			};
	        })    
	    );
	    addToMap(colMap, facultyAndCoachVisits);
	   	//Grabs any 'Class Visits'
		const classVisits = await page.$$eval('#visiting > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'Class Visits')
	        		return{ 
	        			key: element.querySelector('.col-sm-3 > h4').innerText,
	        			value: element.querySelector('.col-sm-9').innerText.trim().replace(/\t*\n*/g, '')
	        			   		.replace("Dates/Times Available", "Dates/Times Available: ")
	        			   		.replace("Arrangements", "\nArrangements: ")
        			};
	        })    
	    );
	    addToMap(colMap, classVisits);
	    //Grabs any 'Overnight Dorm Stays'
		const overNightDormStays = await page.$$eval('#visiting > .row',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('.col-sm-3 > h4') !== null && element.querySelector('.col-sm-3 > h4').innerText === 'Overnight Dorm Stays')
	        		return{ 
	        			key: element.querySelector('.col-sm-3 > h4').innerText,
	        			value: element.querySelector('.col-sm-9').innerText.trim().replace(/\t*\n*/g, '')
	        			   		.replace("Overnight Dorm Stays", "Overnight Dorm Stays: ")
	        			   		.replace("Limitations", "\nLimitations: ")
	        			   		.replace("Arrangements", "\nArrangements: ")
        			};
	        })    
	    );
		addToMap(colMap, overNightDormStays);
		//Grabs any 'Transportation'
		const transportation = await page.$$eval('#visiting > .row > .col-sm-9 > .blurb',
	      nodes =>
	        nodes.map(element => {
	        	return{
	        		key: 'Transportation',
	        		value: element.innerText.trim().replace(/\t*\n*/g, '')
        			   		.replace("Types of Transportation Available to Campus", "Types of Transportation Available to Campus:\n")
        			   		.replace("Driving Instructions to Campus", "\n\nDriving Instructions to Campus:\n")
        			   		.replace("Local Accommodations", "\n\nLocal Accommodations:\n")
	        	}
	        })    
	    );
	    addToMap(colMap, transportation);
	    //End of Visiting Tab
	    const element = await page.$('span[itemprop="name"]');
	    const schoolName = await page.evaluate(element => element.innerText, element);
	    var arr = [schoolName];//Adds name of the current school to arr
	    for(var e of columnNames){
	    	await arr.push(await colMap.get(e));
	    }
		writer.write(arr);
		await browser.close();
	}catch(e){
		console.log('our error', e);
	}finally{
		writer.end();
	}
})();
//Adds all the key value pairs of obj into the passed in hashmap and return it. Ignores properties that are null in obj
var addToMap = (map, obj) => {
    for(property of obj){
    	if(property != null)
			map.set(property.key, property.value);
	}
	return map;
};