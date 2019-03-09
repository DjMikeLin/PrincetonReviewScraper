const puppeteer = require('puppeteer');
const fs = require('fs-extra');
var HashMap = require('hashmap');

(async function main() {
	try{
		var names = await (fs.readFileSync('names.csv', 'utf8')).split('\n');

		const browser = await puppeteer.launch({ headless: false });

		const page = await browser.newPage();
		await page.goto('https://www.princetonreview.com/college-education');
		await page.type('#search', "Yale University");
	  	await Promise.all([
	  		page.waitForNavigation(),
  			page.click("button[type='submit']")
  		]);

	  	const newPage = await browser.newPage();
	  	await newPage.goto(page.url());
		await newPage.waitForSelector('.row');
		//creates key value pair object arrays from unique row names
		const rowNames = await page.$$eval('.row > .col-sm-3 > h4',
	      	nodes =>
	        	nodes.map(element => {
	        		return{
	        			key: element.innerText,
	        			value: "irrelevant"
	        		};
	        	})    
	    );
		//creates a HashMap of rowNames
		const rowNamesMap = new HashMap();
		for(rowName of rowNames){
			rowNamesMap.set(rowName.key, rowName.value);
		}

		var colMap = new HashMap();

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
		//finds the Superscores for ACT and SAT if any
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
	    //Grab any academic or non-academic factors 
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
		const facultyStudentInfo1 = await page.$$eval('#academics > .row > .col-sm-9 > .row > .col-sm-4',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('div') !== null){
	        		if(element.querySelector('div').innerText === "Student/Faculty" ||
	        		   element.querySelector('div').innerText === "Total Faculty" ||
	        		   element.querySelector('div').innerText === "with Terminal Degree")
		        		return{ 
		        			key: element.querySelector('div').innerText,
		        			value: element.querySelector('.number-callout').innerText
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
		const facultyStudentInfo3 = await page.$$eval('#academics > .row > .col-sm-9 > .row > .col-xs-6',
	      nodes =>
	        nodes.map(element => {
	        	if(element.querySelector('div') !== null){
	        		if(element.querySelector('div').innerText === "Most frequent class size" ||
	        		   element.querySelector('div').innerText === "Most frequent lab / sub section size")
		        		return{ 
		        			key: element.querySelector('div').innerText,
		        			value: element.querySelector('.number-callout').innerText
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
		//Grabs any 'Federal Direct Student Loan Programs' and 'Federal Family Education Loan Programs (FFEL)' and
		//'Is Institutional Employment Available (other than Federal Work Study)' and 'Direct Lender'
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
		//Grabs any 'Total Undergraduate Enrollment' and 'Foreign Countries Represented'
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
	    //Grabs any Race Demographics
		var raceDemographics = await page.$$eval('#studentbody > .row > .col-sm-9 > .row.graph-row-container',
	      nodes =>
	        nodes.map(element => {
        		if(element.querySelector('.col-xs-2.col-sm-2.bold') !== null && element.querySelector('.col-xs-5.col-sm-3') !== null)
        			return element.querySelector('.col-xs-5.col-sm-3').innerText.trim() + ' : ' + element.querySelector('.col-xs-2.col-sm-2.bold').innerText.trim();
	        })    
	    );
	    raceDemographics = (raceDemographics.length === 0) ? '' : raceDemographics.join('\n');
	    colMap.set('Race Demographics', raceDemographics);
	    //Grabs any other demographics beside race demographics
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
		await newPage.close();
		await browser.close();
	}catch(e){
		console.log('our error', e);
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