var app = angular.module("noobApp", ["ngRoute", "firebase"])

app.config(function($routeProvider) {
	$routeProvider.when('/', {
		controller: "LogInCtrl",
		templateUrl: "templates/login.html",
	}).when('/signup', {
		controller: "SignUpCtrl",
		templateUrl: "templates/signup.html"
	}).when('/login', {
		controller: "LogInCtrl",
		templateUrl: "templates/login.html"
	})
	$routeProvider.when('/user/:usersId', {
		controller: "MainCtrl",
		templateUrl: "templates/home.html",
		resolve: {
			"currentAuth": function($firebaseAuth) {
				return $firebaseAuth().$requireSignIn();
			}
		}
	})
});

app.run(["$rootScope", "$location", function($rootScope, $location) {
 $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
   // We can catch the error thrown when the $requireSignIn promise is rejected
   // and redirect the user back to the home page
   if (error === "AUTH_REQUIRED") {
     $location.path("/login");
   }
 });
}]);

app.controller("MainCtrl", function($scope, $http, $firebaseArray, $firebaseObject, $firebaseAuth, $location, $routeParams, $route, currentAuth){
	//get users Id
	$scope.authObj = $firebaseAuth();
	$scope.usersId = currentAuth.uid;
	console.log($scope.usersId);
	
	//name getter into MainCtrl
	var nameRef = firebase.database().ref().child("users");
	$scope.firstnames = $firebaseArray(nameRef);
	console.log($scope.firstnames);

	//get users info in MainCtrl
	var userRef = firebase.database().ref().child("users").child($routeParams.usersId);
	$scope.users = $firebaseObject(userRef);
	
	//proposals var for ng-show l-13 of home.html
	var propRef = firebase.database().ref().child("proposals");
	$scope.proposals = $firebaseObject(propRef);
	console.log($scope.proposals);

	//board to be able to log points
	var boardRef = firebase.database().ref().child("board");
	$scope.board = $firebaseObject(boardRef);
	console.log($scope.board);

	//store noob props in proposals
	var nPropRef = firebase.database().ref().child("proposals").child($routeParams.usersId).child("noobProp");
	$scope.noobProp = $firebaseObject(nPropRef);
	//console.log($scope.noobProp);

	//add noob proposals
	//$scope.noobProp
	$scope.addNoobProp = function() {
		// $scope.noobProp.$add({
		// 	'proposed_by': $scope.usersId,
		// 	'created_at': Date.now(),
		// 	'isSeconded': false,
		// });
		$scope.noobProp.proposed_by = $scope.usersId;
		$scope.noobProp.created_at = Date.now();
		$scope.noobProp.isSeconded = false;

		console.log("prop added");
		console.log($scope.proposals);
		$scope.noobProp.$save();
	}

	//store noob points in board
	var nPtRef = firebase.database().ref().child("board").child($routeParams.usersId).child("noobCount");
	$scope.noobCount = $firebaseArray(nPtRef);

	//add noob points
	$scope.addNoobPt = function() {
		if ($scope.usersId === $scope.noobProp.proposed_by) {
			//in the real thing, the above statement should be !==
			//however, without real individual buttons, there's no way
			//to make sure that this works.
			console.log($scope.noobProp);
			console.log($scope.firstnames.$id);

			$scope.noobProp.isSeconded = true;
			$scope.noobProp.seconded_by = $scope.usersId;

			$scope.noobProp.$save();
			
			$scope.noobCount.$add($scope.noobProp);
			console.log($scope.noobCount);
			$scope.noobCount.$save();
			$scope.proposals[$scope.usersId].noobProp = {};
			$scope.proposals.$save();
		}
		else {
			console.log("error, you can't 'second' your own proposal!");
		};
		// console.log($scope.board);
		// $scope.noobCount.$add($scope.noobProp);
		// $scope.noobCount.$save();
		console.log($scope.board);
		console.log($scope.board[$scope.usersId].noobCount.length);
		console.log($scope.noobCount.length);
		console.log($scope.firstnames);
	}
	
	// .then(function(nPropRef) {
	// 	nPropRef = [];
	// })


	//store assassin points in proposals
	var aPropRef = firebase.database().ref().child("proposals").child($routeParams.usersId).child("assnProp");
	$scope.assnProp = $firebaseObject(aPropRef);
	//console.log($scope.assnProp);

	//store assassin points in board
	var aPtRef = firebase.database().ref().child("board").child($routeParams.usersId).child("assnCount");
	$scope.assnPt = $firebaseObject(aPtRef);
	//console.log($scope.assnPt);
	
	//add assassin points
	$scope.assnPt = 0;
	$scope.addAssnPt = function() {
		$scope.assnPt = $scope.assnPt + 1;
		console.log($scope.points);
		console.log($scope.users.points);
	}

	//n00b leaderBoard var
	var leadRef = firebase.database().ref().child("leaderBoard");
	$scope.leaderBoard = $firebaseObject(leadRef);

	//push to leaderBoard
	$scope.addLB = function() {
		
	}

	//clear points
	$scope.clearPts = function() {
		//once you get individual buttons working you'll need a for loop here to cycle through users

		$scope.board[$scope.usersId].noobCount = {};
		$scope.board.$save();
		console.log($scope.board);
	}

	//sign out f(x)
	$scope.signOut= function(){
    	$scope.authObj.$signOut();
    	$location.path("/login")
    };
});



app.controller("SignUpCtrl", function($scope, $http, $firebaseArray, $firebaseObject, $firebaseAuth, $location, $routeParams, $route) {
	$scope.authObj = $firebaseAuth();

	//function to sign up
	$scope.signUp = function() {
		console.log($scope.name + " " + $scope.email); // + " " + $scope.password);


		console.log($scope.authObj);
		$scope.authObj.$createUserWithEmailAndPassword($scope.email, $scope.password)
		.then(function(firebaseUser) {
			console.log(firebaseUser.uid + " created successfully!");
			var userRef = firebase.database().ref().child("users").child(firebaseUser.uid);

			$scope.users = $firebaseObject(userRef);
			
			// //trying to add a points key to users
			// $scope.points = {
			// 	'$scope.noobPt': 0,
			// 	'$scope.assnPt': 0,
			// };
			// console.log($scope.points);
			
			$scope.users.name = $scope.name;
			$scope.users.email = $scope.email;
			//$scope.users.password = $scope.password;
			// $scope.users.points = $scope.points;
			// console.log($scope.users.points);
			$scope.users.$save()
			.then(function(userRef) {
				console.log($scope.users);
				userRef.key === firebaseUser.uid;
				$location.path('/user/'+firebaseUser.uid);
			})	
		}).catch(function(error) {
			console.log("Error: ", error);
		});
	};
});

app.controller("LogInCtrl", function($scope, $http, $route, $firebaseObject, $firebaseArray, $routeParams, $firebaseAuth, $location) {
	$scope.authObj = $firebaseAuth();

    $scope.login = function() {
        //console.log($scope.email);
        //console.log($scope.password);

        $scope.authObj.$signInWithEmailAndPassword($scope.email, $scope.password)
        .then(function(firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
            $location.path('/user/'+firebaseUser.uid);

        }).catch(function(error) {
             console.error("Error: ", error);
        })

    }
});










