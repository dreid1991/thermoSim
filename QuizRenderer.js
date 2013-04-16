function QuizRenderer() {

}

QuizRenderer.prototype = {
	render: function(questions, appendTo) {
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
		//always make submit button because we're making mult choice be click choice, then submit.  Deals with multiple questions better.
		var quiz = new Quiz(questions);
	}
}

function Quiz(questions) {
	
}