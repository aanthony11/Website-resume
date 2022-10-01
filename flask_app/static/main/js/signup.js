function confirmSignup() {
    var email = document.getElementById('email').value;
    var pword = document.getElementById('password').value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var data_d = {'email': email, 'password': pword, "confirmPassword": confirmPassword};

    jQuery.ajax({
        url: "/processSignup",
        data: data_d,
        type: "POST",
        success:function(returned_data){
                returned_data = JSON.parse(returned_data);
                console.log(returned_data)
                if (returned_data["success"] === 1) {
                    window.location.href = "/home";
                } else if (returned_data["success"] === 0) {
                    document.getElementById("failure").innerHTML = `Passwords do not match.`;
                } else if (returned_data["success"] === -1) {
                    document.getElementById("failure").innerHTML = `Email is already in use.`;
                }
            }
    });
}