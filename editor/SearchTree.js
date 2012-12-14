function SearchTree() {
	this.root = undefined;
}

SearchTree.prototype = {
	add: function(key, value) {
		this.root = this.addPrivate(this.root, key, value);
	},
	get: function(key) {
		return this.getPrivate(this.root, key);
	},
	withChange: function(key, value) { 
		return new SearchTree().setRoot(this.withChangePrivate(this.root, key, value));
	},
	withChangePrivate: function(root, key, value) {
		var newNode;
		if (root === undefined) {
			console.log('Tried to change bad key ' + key);
			console.trace();
			return;
		} else if (root.key == key) {
			newNode = new Node(key, value);
			newNode.left = root.left;
			newNode.right = root.right;
			newNode.height = root.height;
		} else if (this.aBeforeB(key, root.key)) {
			newNode = new Node(root.key, root.value);
			newNode.right = root.right;
			newNode.height = root.height;
			newNode.left = this.withChangePrivate(root.left, key, value); 
		} else {
			newNode = new Node(root.key, root.value);
			newNode.left = root.left;
			newNode.height = root.height;
			newNode.right = this.withChangePrivate(root.right, key, value);
		}
		return newNode;
	},
	setRoot: function(root) {
		this.root = root;
		return this;
	},
	getPrivate: function(root, key) {
		if (root === undefined) {
			console.log('Tried to get bad key: ' + key);
			console.trace();
		} else if (key == root.key) {
			return root.value;
		} else if (this.aBeforeB(key, root.key)) {
			return this.getPrivate(root.left, key);
		} else {
			return this.getPrivate(root.right, key);
		}
	},
	addPrivate: function(root, key, value) {
		if (root === undefined) {
			return new Node(key, value);
		} else if (this.aBeforeB(key, root.key)) {
			root.left = this.addPrivate(root.left, key, value);
		} else {
			root.right = this.addPrivate(root.right, key, value);
		}
		if (root.right === undefined) {
			root.height = root.left.height+1;
		} else if (root.left === undefined) {
			root.height = root.right.height+1;
		} else if (root.right.height > root.left.height) {
			root.height = root.right.height+1;
		} else {
			root.height = root.left.height+1;
		}
		
		root = this.balance(root);
		
		return root;
	},
	height: function(root) {
		if (root === undefined) {
			return -1;
		} else {
			return root.height;
		}
	},
	assignHeightFromChildren: function(root) {
		if (root.left===undefined && root.right===undefined) {
			root.height = 0;
		} else if (root.left === undefined) {
			root.height = root.right.height+1;
		} else if (root.right === undefined) {
			root.height = root.left.height+1;
		} else {
			if (root.left.height > root.right.height) {
				root.height = root.left.height+1;
			} else {
				root.height = root.right.height+1;
			}
		}
	},
	rotateRight: function(root) {
		var newRoot = root.left;
		root.left = root.left.right;
		newRoot.right = root;
		this.assignHeightFromChildren(root);
		this.assignHeightFromChildren(newRoot);
		return newRoot;
	},
	rotateLeft: function(root) {
		var newRoot = root.right;
		root.right = root.right.left;
		newRoot.left = root;
		this.assignHeightFromChildren(root);
		this.assignHeightFromChildren(newRoot);
		return newRoot;
	},
	balance: function(root) {
		var heightRight = this.height(root.right);
		var heightLeft = this.height(root.left);
		if (heightLeft > heightRight+1) {
			var heightLeftLeft = this.height(root.left.left);
			var heightLeftRight = this.height(root.left.right);
			
			if (heightLeftLeft > heightLeftRight) {
				return this.rotateRight(root);
			} else {
				root.left = this.rotateLeft(root.left);
				this.assignHeightFromChildren(root);
				return this.rotateRight(root);
			}
		} else if (heightRight > heightLeft+1) {
			var heightRightLeft = this.height(root.right.left);
			var heightRightRight = this.height(root.right.right);
			
			if (heightRightRight > heightRightLeft) {
				return this.rotateLeft(root);
			} else {
				root.right = this.rotateRight(root.right);
				this.assignHeightFromChildren(root);
				return this.rotateLeft(root);
			}
		}
		return root;
	},
	aBeforeB: function(a, b) {
		var minLen = Math.min(a.length, b.length);
		var aTotal = 0;
		var bTotal = 0;
		for (var letterIdx=0; letterIdx<minLen; letterIdx++) {
			aTotal += a.charCodeAt(letterIdx);
			bTotal += b.charCodeAt(letterIdx);
			if (a<b) {
				return true;
			} else if (a>b) {
				return false;
			}
		}
		if (a.length < b.length) {
			return true;
		}
		return false;
	}
}


function Node(key, value) {
	this.key = key;
	this.value = value;
	this.left = undefined;
	this.right = undefined;
	this.height = 0;
	
}

Node.prototype = {
	copy: function() {
		var newNode = new Node(this.key, this.value);
		newNode.left = this.left;
		newNode.right = this.right;
		newNode.height = this.height;
		return newNode;
	}
}


