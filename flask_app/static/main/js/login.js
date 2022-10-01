let count     = 0
function checkCredentials() {
    // package data in a JSON object
    var email = document.getElementById('email').value;
    var pword = document.getElementById('password').value;
    var data_d = {'email': email, 'password': pword}
    console.log('data_d', data_d)

    // SEND DATA TO SERVER VIA jQuery.ajax({})
    jQuery.ajax({
        url: "/processlogin",
        data: data_d,
        type: "POST",
        success:function(returned_data){
                returned_data = JSON.parse(returned_data);
                console.log(returned_data)
                if (returned_data["success"] === 1) {
                    window.location.href = "/home";
                } else {
                    count += 1;
                    document.getElementById("failure").innerHTML = `Authentication failure: ${count}`;

                }
            }
    });
    return false;
}

const inputs = document.querySelectorAll(".input");


function addcl(){
    let parent = this.parentNode.parentNode;
    parent.classList.add("focus");
}

function remcl(){
    let parent = this.parentNode.parentNode;
    if(this.value == ""){
        parent.classList.remove("focus");
    }
}


inputs.forEach(input => {
    input.addEventListener("focus", addcl);
    input.addEventListener("blur", remcl);
});