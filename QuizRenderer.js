function QuizRenderer() {
	this.hoverCol = Col(0, 81, 117);
	this.selectedCol = Col(40, 121, 147);
}

QuizRenderer.prototype = {
	render: function(questions, appendTo) {
		var quiz = new QuizRenderer.Quiz(questions);
		if (this.checkQuizTyping(quiz)) {
			$(appendTo).append(templater.br());
			var wrapperHTML = templater.div({attrs: {id: ['quizWrapper']}, style: {display: 'inline-block'}});
			var contentHTML = templater.div({attrs: {id: ['quizContent'], 'class': ['niceFont', 'whiteFont']}});
			var footerHTML = templater.div({attrs: {id: ['quizFooter']}});

			$(appendTo).append(wrapperHTML);
			var wrapper = $('#quizWrapper');

			$(wrapper).append(contentHTML);
			$(wrapper).append(footerHTML);
			
			var content = $('#quizContent');
			var footer = $('#quizFooter');		
			for (var i=0; i<quiz.questions.length; i++) {
				this.renderQuestion(quiz.questions[i], content);
			}
			if (questions[0] && questions[0].type == 'setVals') {
				this.appendButtons(footer, function(){ sceneNavigator.prevPrompt()}, function(){ sceneNavigator.refresh()}, 'Back', 'Set values');
			} else {
				this.appendButtons(footer, function(){ sceneNavigator.prevPrompt()}, function(){ sceneNavigator.nextPrompt()}, 'Back', 'Submit');
			}
			//always make submit button because we're making mult choice be click choice, then submit.  Deals with multiple questions better.
			return quiz;
		}
	},
	checkQuizTyping: function(quiz) {
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
		var html = '<table width=100%<tr><td width=10%></td><td>';
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
	},
	bindMultChoiceQuestion: function(question) {
		var renderer = this;
		var options = question.options;
		var click = function(idx) {
			var option = options[idx];
			question.answered = true;
			if (!option.selected) {
				for (var i=0; i<options.length; i++) {
					if (options[i] != option) {
						options[i].div.css('background-color', 'transparent');
						options[i].selected = false;
					}
				}
				
				option.selected = true;
				store(question.storeAs, idx);
				if (question.hasCorrectAnswer()) {
					if (option.correct) {
						question.correct = true;
					} else {
						question.correct = false;
					}
				} else {
					question.correct = true;
				}
				$(option.div).css('background-color', renderer.selectedCol.hex);
			}			
		}
		if (getStore(question.storeAs) !== undefined) {
			click(getStore(question.storeAs));
		}
		for (var i=0; i<question.options.length; i++) 
			this.bindMultChoiceOption(question, click, question.options, question.options[i]);
	},
	bindMultChoiceOption: function(question, clickFunc, options, option) {
		var renderer = this;
		var click = function() {

		}
		var hoverIn = function() {
			if (!option.selected) {
				$(this).css('background-color', renderer.hoverCol.hex);
			}
		}
		var hoverOut = function() {
			if (!option.selected) {
				$(this).css('background-color', 'transparent');
			}
		}
		option.div.click(function() {clickFunc(options.indexOf(option))});
		option.div.hover(hoverIn, hoverOut);
	},
	renderTextBox: function(question, appendTo, rows, cols) {
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
		var changeFunc = function(inputAns) {
			var answer = inputAns !== undefined ? inputAns : question.div.val();
			if (answer != '') {
				store(question.storeAs, answer);
				question.answered = true;
				if (question.hasCorrectAnswer()) {
					if (fracDiff(parseFloat(question.answer), parseFloat(val))<.05){
						question.correct = true;
					} else {
						question.correct = false;
					}
				} else {
					question.correct = true;
				}
			}		
		}
		if (getStore(question.storeAs)) {
			changeFunc(getStore(question.storeAs));
			question.div.html(getStore(question.storeAs));
		}
		
		question.div.change(function() {changeFunc()})
		
	},
	appendButtons: function(appendTo, leftFunc, rightFunc, leftLabel, rightLabel) {
		var wrapperId = 'quizSubmitWrapper';
		var leftId = 'quizButtonLeft';
		var rightId = 'quizButtonRight';
		var buttonHTML = templater.button({attrs:{id: [leftId]}, innerHTML: leftLabel}) + templater.button({attrs:{id: [rightId]}, innerHTML: rightLabel});
		var wrapper = templater.div({attrs: {id: [wrapperId]}, style: {'float': 'right'}, innerHTML: buttonHTML});
		$(appendTo).append(wrapper);
		$('#' + leftId).click(leftFunc);
		$('#' + rightId).click(rightFunc);
		addJQueryElems($('#' + leftId), 'button');
		addJQueryElems($('#' + rightId), 'button');
	}
}


QuizRenderer.Quiz = function (questions) {
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
	allCorrect: function() {
		for (var i=0; i<this.questions.length; i++) {
			var question = this.questions[i];
			if (!question.correct) return false;
		}
		return true;
	},
	fireAlertWrong: function() {
		for (var i=0; i<this.questions.length; i++) {
			var question = this.questions[i];
	
			if (question.hasCorrectAnswer() && !question.correct) {
				if (question.type == 'multChoice') {
					for (var j=0; j<question.options.length; j++) {
						if (question.options[j].selected && question.options[j].message) {
							alert(question.options[j].message);
							return;
						}
					}
				} else if (question.message) {
					alert(question.message);
					return;
				}
			
			}
		}
	}
}

QuizRenderer.Question = function(questionData) {
	this.type = questionData.type;
	this.label = questionData.label;
	this.text = questionData.text;
	this.preText = questionData.preText;
	this.units = questionData.units;
	this.message = questionData.message;
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
			procdOptions.push(new QuizRenderer.MultChoiceOption(options[i]));
		}
		return procdOptions;
	},
	hasCorrectAnswer: function() {
		if ((this.type == 'text' || this.type == 'textSmall' || this.type == 'setVals') && this.answer !== undefined) {
			return true
		} else if (this.type == 'multChoice') {
			for (var i=0; i<this.options.length; i++) {
				if (this.options[i].correct) return true;
			}
		}
		return false;
	}
}

QuizRenderer.MultChoiceOption = function(option) {
	this.correct = option.correct || false;
	this.text = option.text;
	this.selected = false;
	this.message = option.message;
	this.div = undefined;
}