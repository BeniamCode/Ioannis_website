<?php
/* Set e-mail recipient */
$myemail  = "beniam@ioannisdimitriadis.com";

/* Check all form inputs using check_input function */
/*$yourname = check_input($_POST['yourname'], "Enter your name");*/
/*$subject  = check_input($_POST['subject'], "Write a subject");*/
/*$email    = check_input($_POST['email']);*/
/*$comments = check_input($_POST['message'], "Write your comments");*/

/* If e-mail is not valid show error message */
if (!preg_match("/([\w\-]+\@[\w\-]+\.[\w\-]+)/", $email))
{
    show_error("E-mail address not valid");
}

foreach ($_POST as $key => $value){
  echo "{$key} = {$value}\r\n";
}

/* Let's prepare the message for the e-mail */
$message = "Hello!

Your contact form has been submitted by:

Name: $yourname
E-mail: $email





Message:
$comments

End of message
";

/* Send the message using mail() function */
/*mail($myemail, $subject, $message);*/

function check_input($data, $problem='')
{
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    if ($problem && strlen($data) == 0)
    {
        show_error($problem);
    }
    return $data;
}

function show_error($myError)
{
?>
    <html>
    <body>

    <b>Please correct the following error:</b><br />
    <?php echo $myError; ?>

    </body>
    </html>
<?php
exit();
}
?>
