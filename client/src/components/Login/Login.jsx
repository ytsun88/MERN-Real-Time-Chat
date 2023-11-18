import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useNavigate, Navigate } from "react-router";
import * as Yup from "yup";
import axios from "axios";
import { useContext, useState } from "react";
import { AccountContext } from "../../context/userContext";

const Login = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AccountContext);
  const [error, setError] = useState(null);
  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: Yup.object({
      username: Yup.string()
        .required("Username required")
        .min(6, "Username too short")
        .max(28, "Username too long"),
      password: Yup.string()
        .required("Password required")
        .min(6, "Password too short")
        .max(28, "Password too long"),
    }),
    onSubmit: (values, actions) => {
      axios
        .post(
          "http://localhost:4000/auth/login",
          {
            username: values.username,
            password: values.password,
          },
          { withCredentials: true }
        )
        .then((response) => {
          if (response.data.token) {
            localStorage.setItem("user", JSON.stringify(response.data));
          }
          setUser(response.data);
          navigate("/");
        })
        .catch((err) => {
          setError(err.response.data);
        });
      actions.resetForm();
    },
  });
  return (
    <>
      {user.token && <Navigate to="/" />}
      {!user.token && (
        <VStack
          as="form"
          w={{ base: "90%", md: "500px" }}
          m="auto"
          justify="center"
          h="100vh"
          spacing="1rem"
          onSubmit={formik.handleSubmit}
        >
          <Heading>Log In</Heading>
          <Text as="p" color="red.500">
            {error}
          </Text>
          <FormControl
            isInvalid={formik.errors.username && formik.touched.username}
          >
            <FormLabel fontSize="lg">Username</FormLabel>
            <Input
              name="username"
              placeholder="Enter username"
              autoComplete="off"
              size="lg"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FormErrorMessage>{formik.errors.username}</FormErrorMessage>
          </FormControl>
          <FormControl
            isInvalid={formik.errors.password && formik.touched.password}
          >
            <FormLabel fontSize="lg">Password</FormLabel>
            <Input
              name="password"
              placeholder="Enter password"
              autoComplete="off"
              type="password"
              size="lg"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
          </FormControl>
          <ButtonGroup pt="1rem">
            <Button colorScheme="teal" type="submit">
              Login
            </Button>
            <Button
              onClick={() => {
                navigate("/register");
              }}
            >
              Create Account
            </Button>
          </ButtonGroup>
        </VStack>
      )}
    </>
  );
};

export default Login;
