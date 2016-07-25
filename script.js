var app = angular.module("noobApp", ["ngRoute", "firebase"])

app.config(function($routeProvider) {
	$routeProvider.when('/', {
		controller: "MainCtrl",
		templateUrl: "templates/home.html",
		resolve: {
			"currentAuth": function($firebaseAuth) {
				return $firebaseAuth().$requireSignIn();
			}
		}
	}).when('/signup', {
		controller: "SignUpCtrl",
		templateUrl: "templates/signup.html"
	}).when('/login', {
		controller: "LogInCtrl",
		templateUrl: "templates/login.html"
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

app.controller("SignUpCtrl", function($scope, $http, $route, $firebaseObject, $firebaseArray,$routeParams,$firebaseAuth, $location) {
	$scope.authObj = $firebaseAuth();

	//function to sign up
	$scope.signUp = function() {
		console.log($scope.name + $scope.email + $scope.password);

		console.log($scope.authObj);
		$scope.authObj.$createUserWithEmailAndPassword($scope.email, $scope.password)
		.then(function(firebaseUser) {
			console.log(firebaseUser.uid + " created successfully!");
			var userRef = firebase.database().ref().child("users").child(firebaseUser.uid);

			$scope.users = $firebaseObject(userRef);
			$scope.users.name = $scope.name;
			$scope.users.email = $scope.email;
			$scope.users.password = $scope.password;
			$scope.users.$save();

			$location.path("/")
		}).catch(function(error) {
			console.error("Error: ", error);
		});
	};
});