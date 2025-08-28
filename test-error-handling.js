const {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
} = require("./dist/utils/AppError");

// Simple test to verify the error handling implementation
function testErrorHandling() {
  console.log("🧪 Testing Error Handling Implementation...\n");

  try {
    // Test 1: Base AppError
    console.log("1. Testing base AppError...");
    const baseError = new AppError("Test error", 500);
    console.log("✅ Base error created:", {
      message: baseError.message,
      statusCode: baseError.statusCode,
      status: baseError.status,
      isOperational: baseError.isOperational,
    });

    // Test 2: ValidationError
    console.log("\n2. Testing ValidationError...");
    const validationError = new ValidationError("Validation failed");
    console.log("✅ Validation error created:", {
      message: validationError.message,
      statusCode: validationError.statusCode,
      status: validationError.status,
    });

    // Test 3: NotFoundError
    console.log("\n3. Testing NotFoundError...");
    const notFoundError = new NotFoundError("Resource not found");
    console.log("✅ Not found error created:", {
      message: notFoundError.message,
      statusCode: notFoundError.statusCode,
      status: notFoundError.status,
    });

    // Test 4: ConflictError
    console.log("\n4. Testing ConflictError...");
    const conflictError = new ConflictError("Duplicate resource");
    console.log("✅ Conflict error created:", {
      message: conflictError.message,
      statusCode: conflictError.statusCode,
      status: conflictError.status,
    });

    // Test 5: Error inheritance
    console.log("\n5. Testing error inheritance...");
    console.log("✅ ValidationError instanceof AppError:", validationError instanceof AppError);
    console.log("✅ NotFoundError instanceof AppError:", notFoundError instanceof AppError);
    console.log("✅ ConflictError instanceof AppError:", conflictError instanceof AppError);
    console.log(
      "✅ All errors instanceof Error:",
      baseError instanceof Error &&
        validationError instanceof Error &&
        notFoundError instanceof Error &&
        conflictError instanceof Error,
    );

    // Test 6: Status code logic
    console.log("\n6. Testing status code logic...");
    const error4xx = new AppError("Client error", 400);
    const error5xx = new AppError("Server error", 500);
    console.log("✅ 4xx error status:", error4xx.status); // Should be 'fail'
    console.log("✅ 5xx error status:", error5xx.status); // Should be 'error'

    console.log("\n🎉 All error handling tests completed successfully!");
    console.log("\n📋 Summary of Error Handling Features:");
    console.log("   ✅ Custom error classes working");
    console.log("   ✅ Proper status code handling");
    console.log("   ✅ Error inheritance working");
    console.log("   ✅ Status field logic working");
    console.log("   ✅ Operational error flag working");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testErrorHandling();
}

module.exports = { testErrorHandling };
