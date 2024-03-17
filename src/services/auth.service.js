const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/tokenManagement");
const { abortIf } = require("../utils/responder");
const { userDTO } = require("../DTOs/user.dto");
const genericRepo = require("../dbservices");
const { otpGenerator } = require("../utils/utils.utils");
const sendEmail = require("../utils/email.util");

const userSignUp = async ({email, password, confirmPassword, phone, firstname, lastname}) => {
  const check = await genericRepo.setOptions('Members', {
    condition: {email}
  }).findOne()
  // const check = await findUserByEmail(data.email);
  abortIf(check, httpStatus.BAD_REQUEST, "Email Already Exists");
  abortIf(password !== confirmPassword, httpStatus.BAD_REQUEST, "Passwords must match");
  const salt = await bcrypt.genSalt(10);
  const enc_password = await bcrypt.hash(password, salt);
  let user = await genericRepo.setOptions('Members', {
    data: {
      email,
      password: enc_password,
      phone,
      firstname,
      lastname,
    }
  }).create()
  const generateOtp = await otpGenerator({member: user})
  await sendEmail({
    to: user.email,
    subject: 'Activate Your Account',
    context: {
      firstname: user.firstname, 
      message: `<p>Thank you for signing up to <b>CooperativeX</b></p>
                <br>
                <p>Please verify your email <a href="${process.env.FRONTEND_URL}/${generateOtp.otpInstance._id}">here</a> or copy <a>${process.env.FRONTEND_URL}/${generateOtp.otpInstance._id}</a> using the otp below.</p>
      `, 
      otp: generateOtp.otp
    }
  })
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  abortIf(user == null, httpStatus.BAD_REQUEST, "Unable to SignUp");
  return {...user.toJSON(), token, ...(process.env.NODE_ENV !== 'production' && {otp:generateOtp})};
};

const login = async ({email, password}) => {
  abortIf(
    !email || !password,
    httpStatus.BAD_REQUEST,
    "Please provide an email or a password"
  );
  const user = await genericRepo.setOptions("Members", {
    condition: {email}
  }).findOne()
  abortIf(!user, httpStatus.BAD_REQUEST, "email or password is wrong");
  const check = await bcrypt.compare(password, user.password);
  //user.password = null;
  const user_data = user.toJSON()
  abortIf(user_data.emailStatus === 'unverified', httpStatus.BAD_REQUEST, 'Please verify your email.')
  abortIf(!check, httpStatus.BAD_REQUEST, "email or password is wrong");
  const token = generateToken({ id: user.id, email: user.email });
  const generateOtp = await otpGenerator({member: user})
  await sendEmail({
    to: user_data.email,
    subject: 'Two Factor Authentication',
    context: {
      firstname: user_data.firstname, 
      message: `Use the code below to complete login.`, 
      otp: generateOtp.otp
    }
  })
  return {
    email: user.email,
    message: 'Proceed to 2fa authentication.'
  }
};

const activateAccount = async ({id, otp}) => {
  let member;
  const token = await genericRepo.setOptions('Otp', {
    condition: {
      member: id, used: false, otp
    }
  }).findOne()
  abortIf(!token, httpStatus.BAD_REQUEST, 'Invalid Otp')
  if(token.otp !== otp){
    await genericRepo.setOptions('Otp', {
      condition: {
        _id: id
      },
      changes: {
        used: true
      }
    }).update()
    abortIf(true, httpStatus.BAD_REQUEST, 'Invalid Otp')
  }
  if(token.otp === otp){
    member = await genericRepo.setOptions('Members', {
      condition: {
        _id: token.member
      },
      changes: {
        emailStatus: 'verified'
      }
    }).update();
    await genericRepo.setOptions('Otp', {
      condition: {
        _id: id
      },
      changes: {
        used: true
      }
    }).update()
  }
  const createWallet = await genericRepo.setOptions('Wallet', {
    // member
    data: {
      member: id,
      currency: "NGN"
    }
  }).create()
  member.wallets.push(createWallet._id)
  await member.save()
  return {
    message: "Successful",
    user: member
  }
}

const authenticate2FA = async ({otp, email}) => {
  //find the User2FA
  const getUser = (await genericRepo.setOptions('Members', {
    condition: {
      email: email
    }
  }).findOne()).toJSON()
  const twoFA = await genericRepo.setOptions('Otp', {
    condition: { otp, member: getUser._id, used: false }
  }).findOne()
  // const { timedHash } = twoFA
  abortIf(!twoFA, httpStatus.BAD_REQUEST, 'OTP has expired. Please Login again.')
  const token = generateToken({
    id: getUser._id,
    role: getUser.role,
    email
  })
  await genericRepo.setOptions('Otp', {
    condition: { _id: twoFA._id },
    changes: {
      used: true
    }
  }).update()
  
  return {
    ...getUser,
    ...token
  }
}


module.exports = {
  login,
  userSignUp,
  activateAccount,
  authenticate2FA
};
