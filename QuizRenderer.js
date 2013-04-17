function QuizRenderer() {
	this.hoverCol = Col(0, 81, 117);
	this.selectedCol = Col(40, 121, 147);
}

QuizRenderer.prototype = {
	render: function(questions, appendTo) {
		var quiz = new Quiz(questions);
		if (this.checkQuizTyping(quiz)) {
			$(appendTo).append(templater.br());
			var wrapperHTML = templater.div({attrs: {id: ['quizWrapper']}, style: {display: 'inline-block'}});
			var contentHTML = templater.div({attrs: {id: ['quizContent'], 'class': ['niceFont', 'whiteFont']}});
			var footerHTML = templater.div({attrs: {id: ['quizFooter']}});

			$(appendTo).append(wrapperHTML);
			var wrapper = $('#quizWrapper');
			$(quizWrapper).append(contentHTML);
			$(quizWrapper).append(footerHTML);
			
			var content = $('#quizContent');
			var footer = $('#quizFooter');		
			for (var i=0; i<quiz.questions.length; i++) {
				this.renderQuestion(quiz.questions[i], content);
			}
			//always make submit button because we're making mult choice be click choice, then submit.  Deals with multiple questions better.
			return quiz;
		}
	}
}

QuizRenderer.prototype = {
	checkTyping: function(quiz) {
		var questions = quiz.questions;
		var hasSetVals = false;
		var hasNotSetVals = false;
		for (var i=0; i<questions.length; i++) {
			questions.type == 'setVals' ? hasSetVals = true : hasNotSetVals = true;
		}
		if (hasSetVals && hasNotSetVals) {
			console.log("Bad quiz typing.  Can't mix setVals with others");
			return false;
		}
		return true;
		
	},
	renderQuestion: function(question, appendTo) {
		//deprecating buttons quiz 
		if (question.type == 'multChoice') {
			this.renderMultChoice(question, appendTo);
		} else if (question.type == 'text') {
			this.renderTextBox(question, appendTo, 3, 50);
		} else if (question.type == 'textSmall') {
			this.renderTextBox(question, appendTo, 1, 10);
		} else if (question.type == 'setVals') {
			this.renderTextBox(question, appendTo, 1, 10);
		}
	},
	renderMultChoice: function(question, appendTo) {
		var options = question.options;
		//do I even close this table?  What is going on?
		var html = '<br><table width=100%<tr><td width=10%></td><td>';
		for (var i=0; i<options.length; i++) {
			var option = options[i];
			var id = question.storeAs + String(i);
			html += templater.div({attrs: {id: [id], class: ['multChoiceBlock']}, innerHTML: option.text})
			
		}
		appendTo.append(html);
		for (var i=0; i<options.length; i++) {
			option = options[i];
			option.div = $('#' + question.storeAs + String(i));
		}
		this.bindMultChoiceQuestion(question);
	}
	bindMultChoiceQuestion: function(question) {
		for (var i=0; i<question.options.length; i++) 
			this.bindMultChoiceOption(question, question.options, question.options[i]);
	},
	bindMultChoiceOption: function(question, options, option) {
		var renderer = this;
		var click = function() {
			if (!option.selected) {
				for (var i=0; i<options.length; i++) {
					if (options[i] != option) {
						options[i].div.css('background-color', 'transparent');
						options[i].selected = false;
					}
				}
				option.selected = true;
				this.css('background-color', renderer.selectedCol.hex);
			}
		}
		var hoverIn = function() {
			if (!option.selected) {
				this.css('background-color', renderer.hoverCol.hex);
			}
		}
		var hoverOut = function() {
			if (!option.selected) {
				this.css('backgroud-color', 'transparent');
			}
		}
		option.div.click(click);
		option.div.hover(hoverIn, hoverOut);
	},
	renderTextBox: function(question, appendTo, row, cols) {
		var textAreaId = question.storeAs;
		var boxText = defaultTo('Type your answer here.', question.text);
		var textareaAttrs = {id: [textAreaId], rows: [rows], cols: [cols] , placeholder: [boxText]};
		textareaHTML = templater.textarea({attrs: textareaAttrs});
		var textBoxHTML = (question.preText === undefined ? '' : (interpreter.interp(question.preText) + templater.br())) + templater.table({attrs: {'class': ['niceFont', 'whiteFont']}, innerHTML:
			templater.tr({innerHTML:
				templater.td({innerHTML:
					question.label
				}) +
				templater.td({innerHTML:
					'&#32;&#32;'
				}) +
				templater.td({innerHTML:
					textareaHTML
				}) +
				templater.td({innerHTML:
					question.units || ''
				})
			})
		})
		appendTo.append(textBoxHTML);
		
		question.div = $('#' + textAreaId);
		
		if (getStore(question.storeAs)) {
			question.div.html(getStore(question.storeAs));
		}
		
		question.div.change(function() {
			var answer = question.div.val();
			if (answer != '') {
				store(question.storeAs, answer);
				question.answered = true;
				if (question.answer !== undefined) {
					if (fracDiff(parseFloat(question.answer), parseFloat(val))<.05){
						question.correct = true;
					} else {
						question.correct = false;
					}
				} else {
					question.correct = true;
				}
			}		
		})
		
	},
}


function QuizRenderer.Quiz(questions) {
	this.questions = [];
	for (var i=0; i<questions.length; i++) {
		this.questions.push(new QuizRenderer.Question(questions[i]));
	}
	
}

QuizRenderer.Quiz.prototype = {
	allAnswered: function() {
		for (var i=0; i<this.questions.length; i++) {
			if (!this.questions[i].answered) return false;
		}
		return true;
	},
	fireAlertWrong: function() {
		for (var i=0; i<this.questions.length; i++) {
			var question = this.questions[i];
			if (question.answer !== undefined && !question.correct && question.messageWrong) {
				alert(question.messageWrong);
				return;
			}
		}
	}
}

function QuizRenederer.Question(questionData) {
	this.type = questionData.type;
	this.label = questionData.label;
	this.text = questionData.text;
	this.preText = questionData.preText;
	this.unit = questionData.units;
	this.messageWrong = questionData.messageWrong;
	this.storeAs = questionData.storeAs;
	this.options = this.makeOptions(questionData.options);
	this.answered = false;
	this.answer = questionData.answer;
	this.correct = false;
	this.div = undefined;
}

QuizRenderer.Question.prototype = {
	makeOptions: function(options) {
		if (!options) return undefined;
		var procdOptions = []
		for (var i=0; i<options.length; i++) {
			var procdOptions.push(new QuizRenderer.MultChoiceOption(options[i]));
		}
		return procdOptions;
	}
}

function QuizRenderer.MultChoiceOption = function(option) {
	this.isCorrect = option.isCorrect;
	this.text = option.text;
	this.selected = false;
	this.alert = option.alert;
	this.div = undefined;
}