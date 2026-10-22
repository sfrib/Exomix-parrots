<?php
// Test fixture: intentionally insecure code used to verify RepoGuard rules.
add_action( 'wp_ajax_delete_bird', 'rg_delete_bird' );
function rg_delete_bird() {
    global $wpdb;
    $id = $_POST['id'];
    $wpdb->query( "DELETE FROM {$wpdb->prefix}birds WHERE id = " . $_POST['id'] );
    wp_send_json_success();
}

add_action( 'wp_ajax_nopriv_register_owner', 'rg_register_owner' );
function rg_register_owner() {
    global $wpdb;
    $wpdb->insert( $wpdb->prefix . 'owners', array( 'name' => sanitize_text_field( $_POST['name'] ) ) );
}

function rg_search() {
    global $wpdb;
    $name = sanitize_text_field( $_GET['q'] );
    $sql = "SELECT * FROM {$wpdb->prefix}birds WHERE name LIKE '%$name%'";
    return $wpdb->get_results( $sql );
}

echo 'Hledáte: ' . $_GET['q'];
echo esc_html( $_GET['q'] );

if ( isset( $_FILES['photo'] ) ) {
    move_uploaded_file( $_FILES['photo']['tmp_name'], WP_CONTENT_DIR . '/uploads/' . $_FILES['photo']['name'] );
}

eval( $code );
system( 'convert ' . $_GET['file'] );
$data = unserialize( base64_decode( $_COOKIE['prefs'] ) );
include $_GET['page'] . '.php';
$hash = md5( $password );
curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false );

register_rest_route( 'registry/v1', '/birds', array(
    'methods'  => 'POST',
    'callback' => 'rg_rest_create',
) );

// eval( $commented_out );
