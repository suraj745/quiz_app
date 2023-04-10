import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Quiz.css"; // Import the CSS file

const Quiz = ({ onFinish }) => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswerIndexes, setSelectedAnswerIndexes] = useState(
    new Array(10).fill(-1)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5001/questions").then((res) => {
      const questions = res.data;
      const randomQuestions = questions
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
      setQuestions(randomQuestions);
    });
  }, []);

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setSelectedAnswerIndexes([
      ...selectedAnswerIndexes.slice(0, questionIndex),
      answerIndex,
      ...selectedAnswerIndexes.slice(questionIndex + 1),
    ]);
  };

  const handleSubmit = () => {
    const score = selectedAnswerIndexes.reduce(
      (totalScore, answerIndex, questionIndex) =>
        totalScore +
        (answerIndex === questions[questionIndex].correctAnswerIndex ? 1 : 0),
      0
    );

    setIsSubmitted(true);
    onFinish(score);
  };

  const isAnswerCorrect = (questionIndex, answerIndex) => {
    return (
      isSubmitted || answerIndex === questions[questionIndex].correctAnswerIndex
    );
  };

  const isAnswerWrong = (questionIndex, answerIndex) => {
    return (
      isSubmitted &&
      answerIndex !== -1 &&
      answerIndex !== questions[questionIndex].correctAnswerIndex
    );
  };

  return (
    <div>
      {questions.length === 0 ? (
        <p>Loading questions...</p>
      ) : isSubmitted ? (
        <div>
          <h1>
            Quiz Score:{" "}
            {selectedAnswerIndexes.reduce(
              (total, currentIndex, index) =>
                currentIndex === questions[index].correctAnswerIndex
                  ? total + 1
                  : total,
              0
            )}
            /{questions.length}
          </h1>
          <h2>Correct Answers:</h2>
          {questions.map((question, index) => (
            <div key={index}>
              <p>
                {`${index + 1}. `}
                {question.answerChoices.map((choice, choiceIndex) => (
                  <span
                    key={choiceIndex}
                    style={
                      choiceIndex === question.correctAnswerIndex
                        ? {
                            color: "green",
                            fontWeight: "bold",
                            marginRight: "10px",
                          }
                        : {}
                    }
                  >
                    {choice}
                    {selectedAnswerIndexes[index] === choiceIndex ? (
                      <strong> (your answer)</strong>
                    ) : null}
                  </span>
                ))}
              </p>
            </div>
          ))}
          <button onClick={() => window.location.reload()}>Retake Quiz</button>
        </div>
      ) : (
        <div>
          {questions.map((question, index) => (
            <div key={index} className="question-container">
              <h2>{`Question ${index + 1}: ${question.questionText}`}</h2>
              <ul>
                {question.answerChoices.map((answer, answerIndex) => (
                  <li
                    key={answerIndex}
                    className={`answer ${
                      isAnswerCorrect(index, answerIndex)
                        ? "correct"
                        : isAnswerWrong(index, answerIndex)
                        ? "wrong"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      id={`answer-${index}-${answerIndex}`}
                      name={`answer-${index}`}
                      value={answerIndex}
                      checked={selectedAnswerIndexes[index] === answerIndex}
                      onChange={() => handleAnswerChange(index, answerIndex)}
                      disabled={isSubmitted}
                    />
                    <label htmlFor={`answer-${index}-${answerIndex}`}>
                      {answer}
                    </label>
                    {isSubmitted && (
                      <span
                        className={`answer-status ${
                          isAnswerCorrect(index, answerIndex)
                            ? "correct"
                            : "wrong"
                        }`}
                        style={
                          isAnswerCorrect(index, answerIndex)
                            ? { color: "green", fontWeight: "bold" }
                            : {}
                        }
                      >
                        {isAnswerCorrect(index, answerIndex)
                          ? "Correct"
                          : "Incorrect"}
                      </span>
                    )}
                  </li>
                ))}
                {isSubmitted && (
                  <div>
                    <p>
                      Correct answer:{" "}
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        {question.answerChoices[question.correctAnswerIndex]}
                      </span>
                    </p>
                    <p>
                      Your answer:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {question.answerChoices[selectedAnswerIndexes[index]]}
                      </span>
                    </p>
                  </div>
                )}
              </ul>
            </div>
          ))}
          <button className="submit-button" onClick={handleSubmit}>
            {" "}
            Submit{" "}
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
